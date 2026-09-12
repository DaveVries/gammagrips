import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "gg_session";
const LOGIN_TTL_MINUTES = 15;
const SESSION_TTL_DAYS = 30;

/** Tokens live in the database hashed; only the holder ever has the plaintext. */
const hash = (raw: string) => createHash("sha256").update(raw).digest("hex");

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string) {
  const list = adminEmails();
  const target = email.trim().toLowerCase();
  // Constant-time-ish: compare against every entry rather than short-circuiting.
  let match = false;
  for (const e of list) {
    const a = Buffer.from(e.padEnd(64).slice(0, 64));
    const b = Buffer.from(target.padEnd(64).slice(0, 64));
    if (timingSafeEqual(a, b)) match = true;
  }
  return match;
}

export async function createLoginToken(email: string) {
  const sql = db();
  const raw = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + LOGIN_TTL_MINUTES * 60_000);
  await sql`
    insert into login_tokens (token_hash, email, expires_at)
    values (${hash(raw)}, ${email.trim().toLowerCase()}, ${expires.toISOString()})
  `;
  return { raw, expires };
}

/** Single use: the UPDATE only matches an unused, unexpired row. */
export async function consumeLoginToken(raw: string) {
  const sql = db();
  const rows = (await sql`
    update login_tokens
       set used_at = now()
     where token_hash = ${hash(raw)}
       and used_at is null
       and expires_at > now()
    returning email
  `) as { email: string }[];
  return rows[0]?.email ?? null;
}

export async function startSession(email: string) {
  const sql = db();
  const raw = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await sql`
    insert into sessions (token_hash, email, is_admin, expires_at)
    values (${hash(raw)}, ${email}, ${isAdminEmail(email)}, ${expires.toISOString()})
  `;
  const jar = await cookies();
  jar.set(SESSION_COOKIE, raw, {
    httpOnly: true,       // unreadable from JavaScript, so XSS cannot steal it
    secure: true,
    sameSite: "lax",      // survives the click from the email, blocks cross-site POSTs
    path: "/",
    expires,
  });
}

export async function currentSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  const sql = db();
  const rows = (await sql`
    select email, is_admin from sessions
     where token_hash = ${hash(raw)} and expires_at > now()
     limit 1
  `) as { email: string; is_admin: boolean }[];
  return rows[0] ?? null;
}

export async function endSession() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    const sql = db();
    await sql`delete from sessions where token_hash = ${hash(raw)}`;
  }
  jar.delete(SESSION_COOKIE);
}
