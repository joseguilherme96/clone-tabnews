import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import setCookieParser from "set-cookie-parser";
import session from "model/session";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

const EXPIRE_IN_MILISECONDS = session.EXPIRE_IN_MILISECONDS;
const MAX_AGE = session.EXPIRE_IN_MILISECONDS / 1000;

describe("POST /api/v1/sessions", () => {
  describe("Create session", () => {
    test("With incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "senha-correta",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorreto@teste.com.br",
          password: "senha-correta",
        }),
      });
      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        status_code: 401,
        action: "Verifique se os dados enviados estão corretos.",
      });
    });

    test("With correct `email` but invalid `password`", async () => {
      await orchestrator.createUser({
        email: "email.correto@teste.com",
      });

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correto@teste.com",
          password: "senha-incorreta",
        }),
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        status_code: 401,
        action: "Verifique se os dados enviados estão corretos.",
      });
    });

    test("With incorrect `email` and incorrect `password`", async () => {
      await orchestrator.createUser();

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.incorreto1@teste.com",
          password: "senha-incorreta1",
        }),
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        status_code: 401,
        action: "Verifique se os dados enviados estão corretos.",
      });
    });

    test("With `correct` email and `correct` password", async () => {
      const newUser = await orchestrator.createUser({
        email: "email.correto@gmail.com.br",
        password: "senha-correta",
      });

      await orchestrator.activateUser(newUser);

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email.correto@gmail.com.br",
          password: "senha-correta",
        }),
      });
      expect(response.status).toBe(201);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        user_id: newUser.id,
        token: responseBody.token,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.user_id)).toBe(4);
      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const createdAt = new Date(responseBody.created_at);
      const expiresIn = new Date(responseBody.expires_at);

      expect(new Date(createdAt) < new Date(expiresIn)).toBe(true);

      const actualLifetimeInMilliseconds = expiresIn - createdAt;
      const lifetimeDifferenceInMilliseconds =
        EXPIRE_IN_MILISECONDS - actualLifetimeInMilliseconds;

      expect(lifetimeDifferenceInMilliseconds).toBeLessThanOrEqual(5000);

      const cookie = response.headers.get("set-cookie");
      expect(
        `session_id=${responseBody.token}; Max-Age=${MAX_AGE}; Path=/; HttpOnly; SameSite=Lax` ==
          cookie,
      ).toBe(true);

      const parsedSetCookie = setCookieParser.parse(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: MAX_AGE,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });
    });
  });
});
