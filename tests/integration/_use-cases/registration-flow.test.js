import orchestrator from "tests/orchestrator";
import email from "tests/orchestrator.email";
import activation from "model/activation.js";
import webserver from "infra/webserver.js";
import user from "model/user.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
  await email.deleteAllEmails();
});

describe("Use case: Resgistration Flow (all sucessful)", () => {
  let createUserBodyResponse;
  let activationTokenObject;
  let createdSessionResponseBody;

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
    expect(createUserBodyResponse.features).toEqual([
      "read:activation_token",
      "read:session",
    ]);
    expect(createUserBodyResponse.email).toBe("resgistration.flow@teste.com");
    expect(createUserBodyResponse.password).toBe(
      createUserBodyResponse.password,
    );
  });

  test("Received activate email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    const extractTokenEmailBody = orchestrator.extractUUID(lastEmail.text);
    activationTokenObject = await activation.findOneValidByToken(
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

  test("Activate user", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationTokenObject.id}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();

    const activetedUser = await user.findOneById(
      activationResponseBody.user_id,
    );

    expect(String(activetedUser.features)).toBe("create:session");
  });

  test("Login", async () => {
    const createdSessionResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: createUserBodyResponse.email,
          password: "ssss383832",
        }),
      },
    );

    expect(createdSessionResponse.status).toBe(201);

    createdSessionResponseBody = await createdSessionResponse.json();

    expect(createdSessionResponse.headers.get("set-cookie")).toBe(
      `session_id=${createdSessionResponseBody.token}; Max-Age=2592000; Path=/; HttpOnly`,
    );
    expect(createdSessionResponseBody.user_id).toBe(createUserBodyResponse.id);
  });

  test("Get user information", async () => {
    const response = await fetch("http://localhost:3000/api/v1/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${createdSessionResponseBody.token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody.id).toBe(createUserBodyResponse.id);
  });
});
