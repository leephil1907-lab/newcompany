import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";
export type SessionUser = { id: string; name: string; email: string; role: "client" | "admin" | "consultant" };
const COOKIE = "agrobridge_session";
function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(value);
}
export async function createSession(user: SessionUser) {
  const [record]=await getDb()`SELECT session_version FROM users WHERE id=${user.id} LIMIT 1`;
  if(!record)throw new Error("Account not found.");
  const token = await new SignJWT({ id:user.id, sessionVersion:Number(record.session_version) }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
}
export async function getSession(): Promise<SessionUser | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.id !== "string") return null;
    // Database role is authoritative so demoted or disabled accounts lose access immediately.
    const rows = await getDb()`SELECT id,name,email,role,session_version FROM users WHERE id=${payload.id} LIMIT 1`;
    const user=rows[0];
    if (!user || !["client","admin","consultant"].includes(user.role) || Number(user.session_version)!==Number(payload.sessionVersion)) return null;
    return { id:String(user.id), name:String(user.name), email:String(user.email), role:user.role as SessionUser["role"] };
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
