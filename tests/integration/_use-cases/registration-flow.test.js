import orchestrator from "tests/orchestrator";
import email from "tests/orchestrator.email";
import activation from "model/activation.js";
import webserver from "infra/webserver.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
  await email.deleteAllEmails();
});

describe("Use case: Resgistration Flow (all sucessful)", () => {
  let createUserBodyResponse;

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

    createUserBodyResponse = await response.json();

    expect(createUserBodyResponse.id).toBe(createUserBodyResponse.id);
    expect(createUserBodyResponse.username).toBe("RegistrationFlow");
    expect(String(createUserBodyResponse.features[0])).toBe(
      "read:activation_token",
    );
    expect(createUserBodyResponse.email).toBe("resgistration.flow@teste.com");
    expect(createUserBodyResponse.password).toBe(
      createUserBodyResponse.password,
    );
  });

  test("Received activate email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    const extractTokenEmailBody = orchestrator.extractUUID(lastEmail.text);
    const activationTokenObject = await activation.findOneValidByToken(
      extractTokenEmailBody,
    );

    expect(extractTokenEmailBody).toBe(activationTokenObject.id);
    expect(activationTokenObject.user_id).toBe(createUserBodyResponse.id);
    expect(activationTokenObject.used_at).toBe(null);

    expect(lastEmail.sender).toBe("<contato@modernsystems.com>");
    expect(lastEmail.recipients[0]).toBe("<resgistration.flow@teste.com>");
    expect(lastEmail.subject).toBe("Ative o seu cadastro");
    expect(lastEmail.text).toContain(`${createUserBodyResponse.username}`);
    expect(lastEmail.text).toContain(activationTokenObject.id);

    expect(lastEmail.text).toContain(
      `${createUserBodyResponse.username},\r\n\r\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/${activationTokenObject.id}\r\n\r\nAtenciosamente,\r\nEquipe ModernSystems\r\n`,
    );
  });
});
