import database from "infra/database";
import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Running pending migrations without the create:migration feature", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se o seu usuário possui a feature create:migration.",
        message: "Usuário não tem permissão para executar esta ação.",
        status_code: 403,
      });
    });
  });
  describe("Default User", () => {
    test("Running pending migrations without the create:migration feature", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const createdUserSession = await orchestrator.createSession(createdUser);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          cookie: `session_id=${createdUserSession.token}`,
        },
      });

      expect(response.status).toBe(403);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se o seu usuário possui a feature create:migration.",
        message: "Usuário não tem permissão para executar esta ação.",
        status_code: 403,
      });
    });
  });

  describe("Privileged User", () => {
    test("Running pending migrations with create:migration feature", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(activatedUser, ["create:migration"]);
      const createdUserSession =
        await orchestrator.createSession(activatedUser);

      const response1 = await fetch(`${webserver.origin}/api/v1/migrations`, {
        method: "POST",
        headers: {
          cookie: `session_id=${createdUserSession.token}`,
        },
      });
      const responseBody1 = await response1.json();

      expect(response1.status).toBe(200);
      expect(Array.isArray(responseBody1)).toBe(true);
      expect(responseBody1.length).toBe(0);

      const countMigration1 = await database.query(
        "SELECT COUNT(*)::int as amount_of_migration FROM pgmigrations",
      );
      expect(countMigration1.rows[0].amount_of_migration).toBeGreaterThan(0);
    });
  });
});
