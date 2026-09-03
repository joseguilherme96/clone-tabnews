import orchestrator from "tests/orchestrator.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("POST /api/v1/status", () => {
  describe("Anonymous User", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        method: "POST",
      });

      const responseBody = await response.json();
      expect(response.status).toBe(405);
      expect(responseBody.name).toBe("MethodNotAllowedError");
      expect(responseBody.message).toBe("O recurso solicitado não é permitido");
      expect(responseBody.action).toBe(
        "Verifique se o método HTTP enviado é válido para este endpoint.",
      );
      expect(responseBody.status_code).toBe(405);
    });
  });
});
