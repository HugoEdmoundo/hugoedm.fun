import bcrypt from "bcryptjs";

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export function isHashed(value: string): boolean {
  return BCRYPT_HASH.test(value);
}

export function hashAccessCode(code: string): Promise<string> {
  return bcrypt.hash(code, 12);
}

export interface VerifyResult {
  ok: boolean;
  /** true bila code cocok tetapi masih tersimpan plaintext -> perlu di-rehash. */
  legacy: boolean;
}

export async function verifyAccessCode(stored: string, code: string): Promise<VerifyResult> {
  if (!stored) return { ok: false, legacy: false };

  if (isHashed(stored)) {
    return { ok: await bcrypt.compare(code, stored), legacy: false };
  }

  return { ok: stored === code, legacy: stored === code };
}

/** Hash sekali pakai agar waktu respons login tetap seragam saat doc belum ada. */
export const DUMMY_HASH = "$2b$12$QWW2tusqMB3qcXk6bIOXjOBXw6ipMYWTyKsZv3NZv2hixpOgXCkfi";
