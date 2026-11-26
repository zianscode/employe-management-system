import type { NextRequest } from "next/server";
import { backendURL, SESSION_COOKIE, sessionHeader } from "@/lib/api/backend";

type Context = { params: Promise<{ path: string[] }> };
const forwardedRequestHeaders = ["Content-Type", "Origin", "Sec-Fetch-Site", "Range"];
const forwardedResponseHeaders = ["Content-Type", "Content-Disposition", "Cache-Control", "X-Request-ID", "X-Content-Type-Options", "Content-Range", "Accept-Ranges", "Allow"];

async function proxy(request: NextRequest, { params }: Context) {
  const { path } = await params;
  if (path.some((part) => part === "." || part === ".." || !/^[\w.-]+$/.test(part))) return new Response(null, { status: 404 });

  const headers = new Headers();
  for (const name of forwardedRequestHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const cookie = sessionHeader(request.cookies.get(SESSION_COOKIE)?.value);
  if (cookie) headers.set("Cookie", cookie);

  try {
    const url = backendURL(`/${path.map(encodeURIComponent).join("/")}`);
    url.search = request.nextUrl.search;
    const init: RequestInit & { duplex?: "half" } = {
      method: request.method, headers, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
    };
    if (request.body && request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      init.duplex = "half";
    }
    const upstream = await fetch(url, init);
    const responseHeaders = new Headers();
    for (const name of forwardedResponseHeaders) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    for (const value of upstream.headers.getSetCookie()) responseHeaders.append("Set-Cookie", value);
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    const requestId = crypto.randomUUID();
    return Response.json({ type: "about:blank", title: "Bad Gateway", status: 502, code: "BACKEND_UNAVAILABLE", detail: "Layanan backend tidak dapat dihubungi", requestId }, {
      status: 502, headers: { "Content-Type": "application/problem+json", "Cache-Control": "no-store", "X-Request-ID": requestId },
    });
  }
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
