import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "model/session";
import * as SetCookieParser from "set-cookie-parser";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  describe("Default user", () => {
    test("With noexistent Session", async () => {
      const noexistent =
        "8b8e00de04454f5d0728bdcb731daf49e99d9620019d322cccc8080283b945f0bb86542cd6dc36ecacc9bca4c1d55bb4";

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "DELETE",
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

    test("With expired Session", async () => {
      jest.useFakeTimers({
        now: new Date() - session.EXPIRE_IN_MILISECONDS,
      });
      const createdUser = await orchestrator.createUser({
        username: "UserWithInvalidSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
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

    test("With valid Session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithSessionValid",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);
      const response = await fetch(`${webserver.origin}/api/v1/sessions`, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        user_id: createdUser.id,
        token: responseBody.token,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(new Date(responseBody.created_at)).not.toBeNaN();
      expect(new Date(responseBody.updated_at)).not.toBeNaN();

      expect(
        responseBody.expires_at < sessionObject.expires_at.toISOString(),
      ).toBe(true);
      expect(
        responseBody.updated_at > sessionObject.updated_at.toISOString(),
      ).toBe(true);

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

      const doubleCheckResponse = await fetch(
        `${webserver.origin}/api/v1/sessions`,
        {
          method: "DELETE",
          headers: {
            Cookie: `session_id=${sessionObject.token}`,
          },
        },
      );

      expect(doubleCheckResponse.status).toBe(401);

      const doubleCheckResponseBody = await doubleCheckResponse.json();

      expect(doubleCheckResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Usuário não possui sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
