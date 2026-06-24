import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import user from "model/user";
import password from "model/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices(), await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const createdUser = await orchestrator.createUser({
        username: "username",
      });

      const responseFindUserByUsername = await fetch(
        "http://localhost:3000/api/v1/users/username",
      );
      const responseBody = await responseFindUserByUsername.json();

      expect(responseFindUserByUsername.status).toBe(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "username",
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDataBase = await user.findOneByUsername("username");
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

    test("With case mismatch", async () => {
      const createdUser = await orchestrator.createUser({
        username: "Username1",
      });

      const responseFindUserByUsername = await fetch(
        `http://localhost:3000/api/v1/users/USERNAME1`,
      );
      const responseBody = await responseFindUserByUsername.json();

      expect(responseFindUserByUsername.status).toBe(200);
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "Username1",
        email: createdUser.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });
    });

    test("With nonexistent username", async () => {
      const responseFindUserByUsername = await fetch(
        `http://localhost:3000/api/v1/users/UsuarioInexistente`,
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
  });
});
