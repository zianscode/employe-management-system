export type Result<T = unknown> = { success: boolean; message: string; data?: T; code?: string };
export type Transport = (path: string, init?: RequestInit) => Promise<Response>;

export async function request<T>(transport: Transport, path: string, method = "GET", body?: unknown): Promise<Result<T>> {
  try {
    const response = await transport(path, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    if (response.status === 204) return { success: true, message: "" };
    const data = await response.json();
    return response.ok ? data : { success: false, message: data.detail || "Terjadi kesalahan sistem", code: data.code };
  } catch {
    return { success: false, message: "Layanan backend tidak dapat dihubungi", code: "BACKEND_UNAVAILABLE" };
  }
}

export const browserTransport: Transport = (path, init) => fetch(`/api/v1${path}`, init);
