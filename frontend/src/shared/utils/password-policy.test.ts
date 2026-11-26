import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validatePasswordStrength } from "./password-policy.ts";

describe("validatePasswordStrength", () => {
  it("menolak password yang terlalu pendek", () => {
    assert.notEqual(validatePasswordStrength("ab12"), null);
  });

  it("menolak password tanpa angka atau tanpa huruf", () => {
    assert.notEqual(validatePasswordStrength("abcdefgh"), null);
    assert.notEqual(validatePasswordStrength("12345678"), null);
  });

  it("menerima password minimal 8 karakter dengan huruf dan angka", () => {
    assert.equal(validatePasswordStrength("abcd1234"), null);
  });
});

