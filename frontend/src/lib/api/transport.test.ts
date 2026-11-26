import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { backendURL, sessionHeader } from "./backend.ts";
import { request } from "./transport.ts";

describe("REST transport", () => {
  it("preserves API problem codes and display messages", async () => {
    const transport = () => Promise.resolve(Response.json({ code: "FORBIDDEN", detail: "Akses ditolak" }, { status: 403 }));
    assert.deepEqual(await request(transport, "/employees"), { success: false, code: "FORBIDDEN", message: "Akses ditolak" });
  });

  it("handles logout without a JSON body", async () => {
    const transport = () => Promise.resolve(new Response(null, { status: 204 }));
    assert.deepEqual(await request(transport, "/auth/logout", "POST"), { success: true, message: "" });
  });

  it("reports a network failure without exposing internals", async () => {
    const transport = () => Promise.reject(new Error("internal address"));
    assert.deepEqual(await request(transport, "/employees"), {
      success: false,
      message: "Layanan backend tidak dapat dihubungi",
      code: "BACKEND_UNAVAILABLE",
    });
  });

  it("forwards only the opaque EMS session cookie", () => {
    assert.equal(sessionHeader("a".repeat(64)), "ems_session=" + "a".repeat(64));
    assert.equal(sessionHeader("a".repeat(64) + "; other=1"), "");
  });

  it("requires an HTTP API origin", () => {
    const previous = process.env.EMS_BACKEND_URL;
    try {
      process.env.EMS_BACKEND_URL = "http://127.0.0.1:8080";
      assert.equal(backendURL("/auth/session").pathname, "/api/v1/auth/session");
      process.env.EMS_BACKEND_URL = "https://api.example.test/private";
      assert.throws(() => backendURL("/auth/session"), /EMS_BACKEND_URL/);
    } finally {
      if (previous === undefined) delete process.env.EMS_BACKEND_URL;
      else process.env.EMS_BACKEND_URL = previous;
    }
  });
});
