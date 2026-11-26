import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { toDateKey } from "./date.ts";

describe("toDateKey", () => {
  it("mengganti tanggal UI pada tengah malam Jakarta", () => {
    assert.equal(toDateKey(new Date("2026-10-21T16:59:59Z")), "2026-10-21");
    assert.equal(toDateKey(new Date("2026-10-21T17:00:00Z")), "2026-10-22");
  });
});
