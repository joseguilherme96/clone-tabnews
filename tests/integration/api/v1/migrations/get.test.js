import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices(), await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous User", () => {
    test("Running pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se o seu usuário possui a feature read:migration.",
        message: "Usuário não tem permissão para executar esta ação.",
        status_code: 403,
      });
    });
  });
  describe("Default User", () => {
    test("Running pending migrations", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      const createdUserSession = await orchestrator.createSession(
        activatedUser.id,
      );

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          cookie: `session_id=${createdUserSession.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        action: "Verifique se o seu usuário possui a feature read:migration.",
        message: "Usuário não tem permissão para executar esta ação.",
        status_code: 403,
      });
    });
  });
  describe("Privileged User", () => {
    test("Running pending migrations", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);
      await orchestrator.addFeaturesToUser(activatedUser, ["read:migration"]);
      const createdUserSession = await orchestrator.createSession(
        activatedUser.id,
      );

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          cookie: `session_id=${createdUserSession.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBe(0);
    });
  });
});
