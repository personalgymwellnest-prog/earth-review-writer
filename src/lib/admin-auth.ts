import { createHash } from "node:crypto";

export const ADMIN_COOKIE_NAME = "earth_admin_session";

function expectedToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return createHash("sha256").update(`earth-review-writer:${password}`).digest("hex");
}

export function checkAdminPassword(password: string): boolean {
  return password.length > 0 && password === (process.env.ADMIN_PASSWORD ?? "");
}

export function issueAdminToken(): string {
  return expectedToken();
}

export function isValidAdminToken(token: string | undefined): boolean {
  return Boolean(token) && token === expectedToken();
}
