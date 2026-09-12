/** Applies every migrations/*.sql in order. Safe to re-run: all statements
 *  are IF NOT EXISTS.
 *
 *  Reads .env.local itself — Next.js loads env files, a bare `node` process
 *  does not, which is why this silently found no DATABASE_URL the first time.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL && existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!process.env[m[1]] && value && !value.includes("SENSITIVE")) {
      process.env[m[1]] = value;
    }
  }
}

const url = process.env.DATABASE_URL;
if (!url || url.includes("SENSITIVE")) {
  console.error(
    "DATABASE_URL is not set.\n" +
      "Put the Neon connection string in .env.local as DATABASE_URL=... and re-run.",
  );
  process.exit(1);
}

const sql = neon(url);

for (const file of readdirSync("migrations").filter((f) => f.endsWith(".sql")).sort()) {
  const body = readFileSync(`migrations/${file}`, "utf8");
  /* Strip whole-line comments *before* splitting. Filtering statements that
     "start with --" silently dropped the first one, because the file opens
     with a comment block — so every index and foreign key then failed against
     a table that had never been created. */
  const statements = body
    .split("\n")
    .filter((line) => !/^\s*--/.test(line))
    .join("\n")
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const st of statements) await sql.query(st);
  console.log(`applied ${file}  (${statements.length} statements)`);
}
console.log("migrations done");
