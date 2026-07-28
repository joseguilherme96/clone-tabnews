import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
});

describe("Use case: Resgistration Flow (all sucessful)", () => {
  test("Create user account", async () => {
    const response = await fetch("http://localhost:3000/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "RegistrationFlow",
        email: "resgistration.flow@teste.com",
        password: "ssss383832",
      }),
    });

    expect(response.status).toBe(201);

    const responseBody = await response.json();

    expect(responseBody.id).toBe(responseBody.id);
    expect(responseBody.username).toBe("RegistrationFlow");
    expect(String(responseBody.features[0])).toBe("read:activation_token");
    expect(responseBody.email).toBe("resgistration.flow@teste.com");
    expect(responseBody.password).toBe(responseBody.password);
  });
});
