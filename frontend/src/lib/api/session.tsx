"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Session } from "./backend";
import { browserTransport, request } from "./transport";

const sessionChanged = "ems-session-changed";
const SessionContext = createContext<{
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  update: () => Promise<Session | null>;
} | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const update = useCallback(async () => {
    const response = await request<Session>(browserTransport, "/auth/session");
    const session = response.data ?? null;
    setData(session);
    setLoading(false);
    return session;
  }, []);

  useEffect(() => {
    const refresh = () => { void update(); };
    refresh();
    window.addEventListener(sessionChanged, refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener(sessionChanged, refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [update]);
  return <SessionContext.Provider value={{ data, status: loading ? "loading" : data ? "authenticated" : "unauthenticated", update }}>
    {children}
  </SessionContext.Provider>;
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("SessionProvider is required");
  return session;
}

export async function signIn({ email, password }: { email: string; password: string }) {
  const response = await request(browserTransport, "/auth/login", "POST", { email, password });
  if (response.code === "BACKEND_UNAVAILABLE" || response.code === "INTERNAL_ERROR") throw new Error(response.message);
  if (response.success) window.dispatchEvent(new Event(sessionChanged));
  return { error: response.success ? undefined : response.message, code: response.code };
}

export async function signOut({ callbackUrl = "/login" }: { callbackUrl?: string } = {}) {
  const result = await request(browserTransport, "/auth/logout", "POST");
  if (!result.success) { toast.error(result.message); return; }
  window.location.assign(callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/login");
}
