import session from "model/session";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import SetCookieParser from "set-cookie-parser";
import user from "model/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/user", () => {
  describe("Anonymous user", () => {
    test("Retrieving the endpoint", async () => {
      const response = await fetch("http://localhost:3000/api/v1/user");

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não tem permissão para executar esta ação.",
        action: `Verifique se o seu usuário possui a feature read:session.`,
        status_code: 403,
      });
    });
  });
  describe("Default User", () => {
    test("With valid Session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithSessionValid",
      });

      const activation = await orchestrator.activateUser(createdUser);

      const createSession = await orchestrator.createSession(createdUser.id);
      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${createSession.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithSessionValid",
        email: createdUser.email,
        password: createdUser.password,
        features: ["create:session", "read:session"],
        created_at: createdUser.created_at.toISOString(),
        updated_at: activation.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(new Date(responseBody.created_at)).not.toBeNaN();
      expect(new Date(responseBody.updated_at)).not.toBeNaN();

      const renowedSession = await session.findOneValidByToken(
        createSession.token,
      );

      expect(renowedSession.expires_at > createSession.expires_at).toBe(true);
      expect(renowedSession.updated_at > createSession.updated_at).toBe(true);

      const parsedSetCookie = SetCookieParser.parse(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id.value).toBe(renowedSession.token);
    });

    test("With noexistent Session", async () => {
      const noexistent =
        "8b8e00de04454f5d0728bdcb731daf49e99d9620019d322cccc8080283b945f0bb86542cd6dc36ecacc9bca4c1d55bb4";

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${noexistent}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With invalid Session", async () => {
      jest.useFakeTimers({
        now: new Date() - session.EXPIRE_IN_MILISECONDS,
      });
      const createdUser = await orchestrator.createUser({
        username: "UserWithInvalidSession",
      });

      await orchestrator.activateUser(createdUser);

      const createSession = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${createSession.token}`,
        },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });

      const parsedSetCookie = SetCookieParser.parse(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("With a valid session expiring in 1 day.", async () => {
      const EXPIRE_IN_MILISECONDS = 60 * 60 * 24 * 29 * 1000;
      const fakeCurrentDateTime = new Date(Date.now() - EXPIRE_IN_MILISECONDS);

      jest.useFakeTimers({
        now: fakeCurrentDateTime,
      });
      const createdUser = await orchestrator.createUser({
        username: "SessionExpiresIn1Day",
      });

      await orchestrator.activateUser(createdUser);

      const createSession = await orchestrator.createSession(createdUser.id);
      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${createSession.token}`,
        },
      });

      expect(response.status).toBe(200);
    });

    test("With a valid session expiring in 1 second.", async () => {
      const EXPIRE_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000 - 1000;
      const fakeCurrentDateTime = new Date(Date.now() - EXPIRE_IN_MILISECONDS);

      jest.useFakeTimers({
        now: fakeCurrentDateTime,
      });
      const createdUser = await orchestrator.createUser({
        username: "SessionExpiresIn1Second",
      });

      await orchestrator.activateUser(createdUser);

      const createSession = await orchestrator.createSession(createdUser.id);
      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${createSession.token}`,
        },
      });

      expect(response.status).toBe(200);
    });

    test("With a valid session expiring in 0.1 second.", async () => {
      const EXPIRE_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000 - 100;
      const fakeCurrentDateTime = new Date(Date.now() - EXPIRE_IN_MILISECONDS);

      jest.useFakeTimers({
        now: fakeCurrentDateTime.setMilliseconds(0),
      });
      const createdUser = await orchestrator.createUser({
        username: "SessionExpiresIn0.1Second",
      });

      const createSession = await orchestrator.createSession(createdUser.id);
      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${createSession.token}`,
        },
      });

      expect(response.status).toBe(401);

      const parsedSetCookie = SetCookieParser.parse(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("Banned user", async () => {
      const newUser = await orchestrator.createUser({
        username: "RegistrationFlow",
        email: "resgistration.flow@teste.com",
        password: "ssss383832",
      });

      await orchestrator.activateUser(newUser);

      const createdSessionResponse = await fetch(
        "http://localhost:3000/api/v1/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: newUser.email,
            password: "ssss383832",
          }),
        },
      );

      const sessionActiveUser = await user.findOneByEmail(
        "resgistration.flow@teste.com",
      );
      await user.setFeatures(sessionActiveUser.id, []);

      const createdSessionResponseBody = await createdSessionResponse.json();

      const bannedUserSessionResponse = await fetch(
        "http://localhost:3000/api/v1/user",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${createdSessionResponseBody.token}`,
          },
        },
      );

      expect(bannedUserSessionResponse.status).toBe(403);

      const bannedUserSessionResponseBody =
        await bannedUserSessionResponse.json();

      expect(bannedUserSessionResponseBody).toEqual({
        name: "ForbiddenError",
        message: "Usuário não tem permissão para executar esta ação.",
        action: `Verifique se o seu usuário possui a feature read:session.`,
        status_code: 403,
      });
    });
  });
});
