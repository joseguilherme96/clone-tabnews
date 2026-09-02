import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import webserver from "infra/webserver.js";
import user from "model/user";

beforeAll(async () => {
  await orchestrator.waitForAllServices(), await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser();
      const activatedUser = await orchestrator.activateUser(createdUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${activatedUser.username}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            username: "UsuarioAnonimo",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não tem permissão para executar esta ação.",
        action: `Verifique se o seu usuário possui a feature update:user.`,
        status_code: 403,
      });
    });
  });
  describe("Default user", () => {
    test("With nonexistent `username`", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const createdSession = await orchestrator.createSession(createdUser);

      const responseFindUserByUsername = await fetch(
        `${webserver.origin}/api/v1/users/UsuarioInexistente`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${createdSession.token}`,
          },
        },
      );
      const responseBody = await responseFindUserByUsername.json();

      expect(responseFindUserByUsername.status).toBe(404);
      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("With Duplicate `username`", async () => {
      await orchestrator.createUser({
        username: "duplicateUsername",
      });

      const createdUser = await orchestrator.createUser({
        username: "duplicateUsername1",
      });
      await orchestrator.activateUser(createdUser);
      const createdSession = await orchestrator.createSession(createdUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/duplicateUsername1`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${createdSession.token}`,
          },
          body: JSON.stringify({
            username: "duplicateUsername",
            email: "duplicateUsername1@outlook.com.br",
            password: "senha1234",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        action: "Utilize outro username para realizar está operação.",
        message: "O username informado já está sendo utilizado.",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With Duplicate `email`", async () => {
      await orchestrator.createUser({
        email: "duplicateEmail@outlook.com.br",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "duplicateEmail1@outlook.com.br",
      });

      await orchestrator.activateUser(createdUser2);
      const createdUser2Session =
        await orchestrator.createSession(createdUser2);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${createdUser2Session.token}`,
          },
          body: JSON.stringify({
            email: "duplicateEmail@outlook.com.br",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toEqual({
        action: "Utilize outro email para realizar está operação.",
        message: "O email informado já está sendo utilizado.",
        name: "ValidationError",
        status_code: 400,
      });
    });

    test("With Unique `username`", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUser1",
      });

      await orchestrator.activateUser(createdUser);
      const createdUserSession = await orchestrator.createSession(createdUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/uniqueUser1`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: `session_id=${createdUserSession.token}`,
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With Unique `email`", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail1@outlook.com.br",
      });

      await orchestrator.activateUser(createdUser);
      const createdUserSession = await orchestrator.createSession(createdUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: `session_id=${createdUserSession.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmail2@outlook.com.br",
          }),
        },
      );

      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const findUser = await user.findOneByUsername(createdUser.username);
      expect(findUser.email).toBe("uniqueEmail2@outlook.com.br");
    });

    test("With new `password`", async () => {
      const createdUser = await orchestrator.createUser({
        password: "242424242",
      });

      await orchestrator.activateUser(createdUser);
      const createdUserSession = await orchestrator.createSession(createdUser);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: `session_id=${createdUserSession.token}`,
          },
          body: JSON.stringify({
            password: "45332222",
          }),
        },
      );

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: createdUser.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With an `userA` modifying `userB`", async () => {
      const createdUser1 = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser1);
      const createdUser1Session =
        await orchestrator.createSession(createdUser1);

      const createdUser2 = await orchestrator.createUser();

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: `session_id=${createdUser1Session.token}`,
          },
          body: JSON.stringify({
            username: "ProibidoAlterarUsuario",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para atualizar outro usuário.",
        action:
          "Verifique se você possui a feature necessária para atualizar outro usuário.",
        status_code: 403,
      });
    });
  });
  describe("Privileged user", () => {
    test("With an `userA` modifying `userB`", async () => {
      const createdUserA = await orchestrator.createUser();
      const activatedUserA = await orchestrator.activateUser(createdUserA);
      await orchestrator.addFeaturesToUser(activatedUserA, [
        "update:user:others",
      ]);
      const createdUserASession =
        await orchestrator.createSession(createdUserA);

      const createdUserB = await orchestrator.createUser();
      const activatedUserB = await orchestrator.activateUser(createdUserB);

      const response = await fetch(
        `${webserver.origin}/api/v1/users/${activatedUserB.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            cookie: `session_id=${createdUserASession.token}`,
          },
          body: JSON.stringify({
            username: "UserAPodeAlterarUserB",
          }),
        },
      );

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "UserAPodeAlterarUserB",
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
