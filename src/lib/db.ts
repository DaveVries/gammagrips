import { neon } from "@neondatabase/serverless";

/**
 * Neon over HTTP. No connection pool to manage, which is what you want on
 * serverless — a pooled TCP client leaks connections when functions freeze.
 *
 * Lazily created so that importing this module during the build does not
 * require DATABASE_URL to exist.
 */
let client: ReturnType<typeof neon> | null = null;

export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = neon(url);
  }
  return client;
}
