import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/** Vergleicht ein übergebenes Secret zeitkonstant mit dem erwarteten (leer = nie gültig). */
export function secretMatches(given: unknown, expected: string): boolean {
  if (!expected || typeof given !== "string" || given === "") {
    return false;
  }
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
