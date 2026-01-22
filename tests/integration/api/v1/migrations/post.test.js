import database from "infra/database";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  (await orchestrator.waitForAllServices(), await cleanDataBase());
});

async function cleanDataBase() {
  await database.query("drop schema public cascade; create schema public;");
}

test("POST to /api/v1/migrations should return 201", async () => {
  const response1 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  const responseBody1 = await response1.json();

  expect(response1.status).toBe(201);
  expect(Array.isArray(responseBody1)).toBe(true);
  expect(responseBody1.length).toBeGreaterThan(0);

  const countMigration1 = await database.query(
    "SELECT COUNT(*)::int as amount_of_migration FROM pgmigrations",
  );
  expect(countMigration1.rows[0].amount_of_migration).toBeGreaterThan(0);

  const response2 = await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });
  expect(response2.status).toBe(200);

  const responseBody2 = await response2.json();

  const countMigration2 = await database.query(
    "SELECT COUNT(*)::int as amount_of_migration FROM pgmigrations",
  );
  expect(countMigration2.rows[0].amount_of_migration).toBe(1);

  expect(Array.isArray(responseBody2)).toBe(true);
  expect(responseBody2.length).toBe(0);
});
