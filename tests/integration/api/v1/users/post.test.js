import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import password from "model/password";
import user from "model/user";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid date", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "joseguilherme96",
          email: "jose.guilherme96@outlook.com.br",
          password: "sss",
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "joseguilherme96",
        features: ["read:activation_token"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDataBase = await user.findOneByUsername("joseguilherme96");
      const correctPasswordMatch = await password.compare(
        "sss",
        userInDataBase.password,
      );
      const incorrectPasswordMatch = await password.compare(
        "SenhaErrada",
        userInDataBase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("With duplicated `email`", async () => {
      await orchestrator.createUser({
        email: "duplicate@outlook.com.br",
      });

      const secondResponse = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "joseguilherme963",
          email: "duplicate@outlook.com.br",
          password: "sss",
        }),
      });

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toBe(400);
      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar está operação.",
        status_code: 400,
      });
    });

    test("With duplicated `username`", async () => {
      await orchestrator.createUser({
        username: "usernameduplicate",
      });

      const secondResponse = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Usernameduplicate",
          email: "usernameduplicate2@outlook.com.br",
          password: "sss",
        }),
      });

      const secondResponseBody = await secondResponse.json();

      expect(secondResponse.status).toBe(400);
      expect(secondResponseBody).toEqual({
        name: "ValidationError",
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar está operação.",
        status_code: 400,
      });
    });

    test("With create:user feature", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "UsuarioNaoLogado",
          email: "usuario.nao.logado@outlook.com.br",
          password: "ssss44",
        }),
      });

      expect(response.status).toBe(201);
    });
  });

  describe("Default user", () => {
    test("Without create:user feature", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.tokenActivation(createdUser);
      await orchestrator.activateUser(createdUser);
      const createdSession = await orchestrator.createSession(createdUser);

      const response = await fetch(`${webserver.origin}/api/v1/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${createdSession.token}`,
        },
        body: JSON.stringify({
          username: "UsuarioLogado",
          email: "usuario.logado@outlook.com.br",
          password: "sss",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não tem permissão para executar esta ação.",
        action: "Verifique se o seu usuário possui a feature create:user.",
        status_code: 403,
      });
    });
  });
});
