import { describe, expect, it } from "vitest";
import { DUMMY_HASH, hashAccessCode, isHashed, verifyAccessCode } from "../src/utils/access-code.js";
import { MAX_PAGE_SIZE, parseListQuery } from "../src/routes/crud.js";

describe("access code hashing", () => {
  it("hash yang dihasilkan terbaca sebagai bcrypt", async () => {
    const hash = await hashAccessCode("kode-rahasia");
    expect(isHashed(hash)).toBe(true);
    expect(hash).not.toContain("kode-rahasia");
  });

  it("verifikasi hash benar/salah", async () => {
    const hash = await hashAccessCode("kode-rahasia");
    expect(await verifyAccessCode(hash, "kode-rahasia")).toEqual({ ok: true, legacy: false });
    expect(await verifyAccessCode(hash, "kode-lain")).toEqual({ ok: false, legacy: false });
  });

  it("mendeteksi code lama yang masih plaintext (legacy)", async () => {
    expect(await verifyAccessCode("kode-lama", "kode-lama")).toEqual({ ok: true, legacy: true });
    expect(await verifyAccessCode("kode-lama", "lain")).toEqual({ ok: false, legacy: false });
    expect(await verifyAccessCode("", "apa saja")).toEqual({ ok: false, legacy: false });
  });

  it("isHashed menolak string biasa dan DUMMY_HASH valid", () => {
    expect(isHashed("?hl%3Did<26")).toBe(false);
    expect(isHashed("")).toBe(false);
    expect(isHashed(DUMMY_HASH)).toBe(true);
  });
});

describe("parseListQuery", () => {
  it("undefined saat tidak ada query pagination", () => {
    expect(parseListQuery({})).toEqual({ page: undefined, limit: undefined });
  });

  it("mengubah string query jadi number", () => {
    expect(parseListQuery({ page: "3", limit: "10" })).toEqual({ page: 3, limit: 10 });
  });

  it("melempar error 400 untuk nilai tidak valid", () => {
    expect(() => parseListQuery({ page: "0" })).toThrow(/validation failed/i);
    expect(() => parseListQuery({ limit: String(MAX_PAGE_SIZE + 1) })).toThrow(/validation failed/i);
    expect(() => parseListQuery({ limit: "abc" })).toThrow(/validation failed/i);
    try {
      parseListQuery({ page: "0" });
    } catch (err) {
      expect((err as Error & { status?: number }).status).toBe(400);
    }
  });
});
