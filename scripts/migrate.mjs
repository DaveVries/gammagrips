/** Applies every migrations/*.sql in order. Safe to re-run: all statements
 *  are IF NOT EXISTS. Needs DATABASE_URL in the environment. */
import { readFileSync, readdirSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url || url.includes("SENSITIVE")) {
  console.error("DATABASE_URL is not set. See the note in README.md.");
  process.exit(1);
}
const sql = neon(url);

for (const file of readdirSync("migrations").filter((f) => f.endsWith(".sql")).sort()) {
  const body = readFileSync(`migrations/${file}`, "utf8");
  // neon's http driver runs one statement per call
  const statements = body
    .split(/;\s*$/m)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("--"));
  for (const st of statements) await sql.query(st);
  console.log(`applied ${file}  (${statements.length} statements)`);
}
console.log("migrations done");
