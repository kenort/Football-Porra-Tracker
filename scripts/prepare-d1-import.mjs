import { readFile, writeFile } from "node:fs/promises";

const [, , inputPath, outputPath] = process.argv;

if (!inputPath || !outputPath) {
  console.error("Usage: node scripts/prepare-d1-import.mjs <input.sql> <output.sql>");
  process.exit(1);
}

const source = await readFile(inputPath, "utf8");
const statements = splitStatements(source)
  .map((statement) => statement.trim())
  .filter(Boolean)
  .filter((statement) => !/^PRAGMA\b/i.test(statement));

const createTables = [];
const createIndexesAndTriggers = [];
const inserts = [];
const rest = [];

for (const statement of statements) {
  if (/^CREATE\s+TABLE\b/i.test(statement)) {
    createTables.push(statement);
  } else if (/^CREATE\s+(?:UNIQUE\s+)?(?:INDEX|TRIGGER|VIEW)\b/i.test(statement)) {
    createIndexesAndTriggers.push(statement);
  } else if (/^INSERT\s+INTO\b/i.test(statement)) {
    inserts.push(statement);
  } else {
    rest.push(statement);
  }
}

const output = [
  "PRAGMA foreign_keys=OFF;",
  "PRAGMA defer_foreign_keys=TRUE;",
  ...createTables,
  ...rest,
  ...inserts,
  ...createIndexesAndTriggers,
  "PRAGMA foreign_keys=ON;",
  "",
].join("\n");

await writeFile(outputPath, output, "utf8");

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let quote = null;

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index];
    const next = sql[index + 1];
    current += char;

    if (quote) {
      if (char === quote && next === quote) {
        current += next;
        index += 1;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"') {
      quote = char;
      continue;
    }

    if (char === ";") {
      statements.push(current);
      current = "";
    }
  }

  if (current.trim()) statements.push(current);
  return statements;
}
