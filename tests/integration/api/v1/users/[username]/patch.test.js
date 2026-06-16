import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices(), await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/", () => {
  describe("Anonymous user", () => {
    test("With Duplicate 'username'", async () => {
      const responseUser1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateUsername",
          email: "duplicateUsername@outlook.com.br",
          password: "senha1234",
        }),
      });

      expect(responseUser1.status).toBe(201);

      const responseUser2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateUsername1",
          email: "duplicateUsername1@outlook.com.br",
          password: "senha1234",
        }),
      });

      expect(responseUser2.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/duplicateUsername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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

    test("With Duplicate 'email'", async () => {
      const responseUser1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateEmail",
          email: "duplicateEmail@outlook.com.br",
          password: "senha1234",
        }),
      });

      expect(responseUser1.status).toBe(201);

      const responseUser2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "duplicateEmail1",
          email: "duplicateEmail1@outlook.com.br",
          password: "senha1234",
        }),
      });

      expect(responseUser2.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/duplicateEmail",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "duplicateEmail1@outlook.com.br",
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

    test("With Unique 'user'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueUser1@outlook.com.br",
          password: "senha1234",
        }),
      });

      expect(user1Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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
        email: "uniqueUser1@outlook.com.br",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With Unique 'email'", async () => {
      const user1Response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueEmail1@outlook.com.br",
          password: "senha1234",
        }),
      });

      expect(user1Response.status).toBe(201);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
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
        username: "uniqueEmail1",
        email: "uniqueEmail2@outlook.com.br",
        password: responseBody.password,
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
