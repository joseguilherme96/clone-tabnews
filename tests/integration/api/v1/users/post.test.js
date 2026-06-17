import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";
import password from "model/password";
import user from "model/user";

beforeAll(async () => {
  await orchestrator.waitForAllServices(), await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid date", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
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
        email: "jose.guilherme96@outlook.com.br",
        password: responseBody.password,
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

    test("With duplicated 'email'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "jose.guilherme96",
          email: "duplicate@outlook.com.br",
          password: "sss",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
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

    test("With duplicated 'username'", async () => {
      const firstResponse = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameduplicate",
          email: "usernameduplicate1@outlook.com.br",
          password: "sss",
        }),
      });

      expect(firstResponse.status).toBe(201);

      const secondResponse = await fetch("http://localhost:3000/api/v1/users", {
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
  });
});
