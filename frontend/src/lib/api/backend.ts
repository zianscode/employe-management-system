import type { components } from "./schema";
import { request, type Transport } from "./transport.ts";

export const SESSION_COOKIE = "ems_session";

export type Session = components["schemas"]["Session"];

export function backendURL(path: string) {
  const origin = new URL(process.env.EMS_BACKEND_URL || "http://127.0.0.1:8080");
  if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password ||
      origin.pathname !== "/" || origin.search || origin.hash) {
    throw new Error("EMS_BACKEND_URL must be an HTTP or HTTPS origin");
  }
  return new URL(`/api/v1${path}`, origin);
}

export function sessionHeader(token: string | undefined) {
  return token && /^[0-9a-f]{64}$/.test(token) ? `${SESSION_COOKIE}=${token}` : "";
}

export function backendTransport(token?: string): Transport {
  return (path, init) => {
    const headers = new Headers(init?.headers);
    const cookie = sessionHeader(token);
    if (cookie) headers.set("Cookie", cookie);
    return fetch(backendURL(path), { ...init, headers, cache: "no-store", signal: AbortSignal.timeout(10000), redirect: "error" });
  };
}

export async function readSession(token?: string): Promise<Session | null> {
  if (!sessionHeader(token)) return null;
  const result = await request<Session>(backendTransport(token), "/auth/session");
  return result.data ?? null;
}
