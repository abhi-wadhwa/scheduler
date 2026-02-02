import { sql } from "@vercel/postgres";
import { readFileSync } from "fs";
import { join } from "path";

async function seed() {
  const migrate = readFileSync(join(__dirname, "migrate.sql"), "utf-8");
  const seedSql = readFileSync(join(__dirname, "seed.sql"), "utf-8");

  // Run migration
  for (const statement of migrate.split(";").filter((s) => s.trim())) {
    await sql.query(statement);
  }
  console.log("Tables created.");

  // Run seed
  for (const statement of seedSql.split(";").filter((s) => s.trim())) {
    await sql.query(statement);
  }
  console.log("Time slots seeded.");
}

seed()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
