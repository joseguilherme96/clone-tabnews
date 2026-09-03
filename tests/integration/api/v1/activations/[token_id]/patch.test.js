import orchestrator from "tests/orchestrator";
import activation from "model/activation.js";
import { version as uuidVersion } from "uuid";
import user from "model/user";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/activations/[token_id]", () => {
  describe("Anonymous user", () => {
    test("With nonexistent token", async () => {
      const response = await fetch(
        `${webserver.origin}/api/v1/activations/cf7ee67e-6f3f-47b2-b65c-3df7d9a6f1d7`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: `Faça um novo cadastro.`,
        status_code: 404,
      });
    });

    test("With valid token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await orchestrator.tokenActivation(createdUser);

      const activationResponse = await fetch(
        `${webserver.origin}/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(activationResponse.status).toBe(200);

      const activationResponseBody = await activationResponse.json();

      expect(activationResponseBody).toEqual({
        id: activationToken.id,
        user_id: createdUser.id,
        used_at: activationResponseBody.used_at,
        created_at: activationToken.created_at.toISOString(),
        expires_at: activationToken.expires_at.toISOString(),
        updated_at: activationResponseBody.updated_at,
      });

      expect(uuidVersion(activationResponseBody.id)).toBe(4);
      expect(uuidVersion(activationResponseBody.user_id)).toBe(4);

      expect(activationResponseBody.user_id).toBe(createdUser.id);

      expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();
      expect(Date.parse(activationResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(activationResponseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(activationResponseBody.updated_at)).not.toBeNaN();

      expect(
        activationResponseBody.created_at >
          createdUser.created_at.toISOString(),
      ).toBe(true);
      expect(
        activationResponseBody.expires_at > activationResponseBody.created_at,
      ).toBe(true);
      expect(
        activationResponseBody.updated_at > activationResponseBody.created_at,
      ).toBe(true);

      const expiresAt = new Date(activationResponseBody.expires_at);
      const createdAt = new Date(activationResponseBody.created_at);

      createdAt.setMilliseconds(0);
      expiresAt.setMilliseconds(0);

      const activationTokenExpirationTime =
        orchestrator.activationTokenExpirationTime();
      expect(expiresAt - createdAt).toBe(activationTokenExpirationTime);

      const activedUser = await user.findOneById(
        activationResponseBody.user_id,
      );

      expect(activedUser.features).toEqual([
        "create:session",
        "read:session",
        "update:user",
      ]);
    });

    test("With expired token", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser();
      const activationToken = await orchestrator.tokenActivation(createdUser);

      jest.useRealTimers();

      const response = await fetch(
        `${webserver.origin}/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
        status_code: 404,
      });
    });

    test("With already used token", async () => {
      const createdUser = await orchestrator.createUser();
      const activationToken = await orchestrator.tokenActivation(createdUser);

      const usedTokenResponse = await fetch(
        `${webserver.origin}/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
        },
      );

      expect(usedTokenResponse.status).toBe(200);

      const response = await fetch(
        `${webserver.origin}/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
          headers: {
            "Context-Type": "application/json",
          },
        },
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Você não pode mais utilizar tokens de ativação.",
        action: "Entre em contato com o suporte.",
        status_code: 403,
        name: "ForbiddenError",
      });
    });

    test("With valid token but already activated user", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const activationToken = await orchestrator.tokenActivation(createdUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/activations/${activationToken.id}`,
        {
          method: "PATCH",
          headers: {
            "Context-Type": "application/json",
          },
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        message: "Você não pode mais utilizar tokens de ativação.",
        action: "Entre em contato com o suporte.",
        status_code: 403,
        name: "ForbiddenError",
      });
    });
  });

  describe("Default user", () => {
    test("With valid token, but already logged in user", async () => {
      const user1 = await orchestrator.createUser({
        password: "senha-correta",
      });
      orchestrator.tokenActivation(user1);
      await orchestrator.activateUser(user1);
      const user1SessionObject = await orchestrator.createSession(user1);

      const user2 = await orchestrator.createUser();
      const activationTokenUser2 = await orchestrator.tokenActivation(user2);

      const acivateUser2Response = await fetch(
        `${webserver.origin}/api/v1/activations/${activationTokenUser2.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${user1SessionObject.token}`,
          },
        },
      );

      expect(acivateUser2Response.status).toBe(403);

      const acivateUser2ResponseBody = await acivateUser2Response.json();

      expect(acivateUser2ResponseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não tem permissão para executar esta ação.",
        action:
          "Verifique se o seu usuário possui a feature read:activation_token.",
        status_code: 403,
      });
    });
  });
});
