import { mkdirSync, writeFileSync } from "node:fs";
import { pbkdf2Sync } from "node:crypto";

const COUNT = Number(process.env.LOAD_USER_COUNT || 1000);
const PASSWORD = process.env.LOAD_PASSWORD || "LoadTest123!";
const ORGANIZATION_ID = process.env.LOAD_ORG_ID || "";
const LEAGUE_ID = process.env.LOAD_LEAGUE_ID || "";
const EMAIL_PREFIX = process.env.LOAD_EMAIL_PREFIX || "loadtest";
const DOMAIN = process.env.LOAD_EMAIL_DOMAIN || "example.test";
const USERS_JSON = process.env.LOAD_USERS_JSON || "./tests/load/users.generated.json";
const SQL_FILE = process.env.LOAD_SQL_FILE || "./tmp/load-users.sql";
const PASSWORD_ITERATIONS = 100_000;
const PASSWORD_KEY_BYTES = 32;
const SALT_HEX = "6c6f6164746573742d66697865642d73616c74";

if (!ORGANIZATION_ID || !LEAGUE_ID) {
  throw new Error("Debes definir LOAD_ORG_ID y LOAD_LEAGUE_ID.");
}

if (!Number.isInteger(COUNT) || COUNT < 1 || COUNT > 5000) {
  throw new Error("LOAD_USER_COUNT debe estar entre 1 y 5000.");
}

function sql(value) {
  return String(value ?? "").replace(/'/g, "''");
}

const salt = Buffer.from(SALT_HEX, "hex");
const hashHex = pbkdf2Sync(PASSWORD, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_BYTES, "sha256").toString("hex");
const now = new Date().toISOString();
const users = [];
const statements = [];

for (let index = 1; index <= COUNT; index += 1) {
  const padded = String(index).padStart(4, "0");
  const id = `load-user-${padded}`;
  const email = `${EMAIL_PREFIX}-${padded}@${DOMAIN}`;
  const name = `Usuario Carga ${padded}`;
  users.push({ email, password: PASSWORD });

  statements.push(
    `INSERT OR IGNORE INTO users (
       id, email, email_normalized, display_name, password_hash, password_salt,
       role, is_active, organization_id, must_change_password, password_changed_at, created_at, updated_at
     ) VALUES (
       '${sql(id)}', '${sql(email)}', '${sql(email)}', '${sql(name)}', '${hashHex}', '${SALT_HEX}',
       'user', 1, '${sql(ORGANIZATION_ID)}', 0, '${sql(now)}', '${sql(now)}', '${sql(now)}'
     );`,
  );
  statements.push(
    `INSERT OR IGNORE INTO league_memberships (user_id, league_id, created_at)
     VALUES ('${sql(id)}', '${sql(LEAGUE_ID)}', '${sql(now)}');`,
  );
}

mkdirSync("./tmp", { recursive: true });
mkdirSync("./tests/load", { recursive: true });
writeFileSync(SQL_FILE, `${statements.join("\n")}\n`);
writeFileSync(USERS_JSON, `${JSON.stringify(users, null, 2)}\n`);

console.log(`Usuarios generados: ${COUNT}`);
console.log(`SQL: ${SQL_FILE}`);
console.log(`JSON k6: ${USERS_JSON}`);
