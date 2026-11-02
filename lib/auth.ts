import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
export type SessionUser = { id: string; name: string; email: string; role: "client" | "admin" | "consultant" };
const COOKIE = "agrobridge_session";
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(value);
}
export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string" || typeof payload.email !== "string" || typeof payload.role !== "string" || typeof payload.name !== "string") return null;
    if (!["client", "admin", "consultant"].includes(payload.role)) return null;
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role as SessionUser["role"] };
  } catch { return null; }
}
export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}
export async function requireStaff() {
  const user = await getSession();
  return user && (user.role === "admin" || user.role === "consultant") ? user : null;
}
