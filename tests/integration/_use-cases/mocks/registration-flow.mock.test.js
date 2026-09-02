import orchestrator from "tests/orchestrator";
import {
  getEmails,
  getEmailById,
  deleteAllEmails,
} from "tests/orchestrator.email";
import activation from "model/activation.js";
import webserver from "infra/webserver";
import user from "model/user";

jest.mock("model/activation.js", () => {
  const originalModule = jest.requireActual("model/activation.js");

  return {
    __esModule: true,
    ...originalModule,
    findOneByUserId: jest.fn(() => {
      return {
        id: "3c8d-46f9-3624cf8f-3c8d-46f9-3624cf8",
        user_id: "3624cf8f-3c8d-46f9-8e3c-64b3a0c61e1",
        expires_at: "",
        updated_at: "",
      };
    }),
  };
});
jest.mock("tests/orchestrator.email.js", () => {
  const originalModule = jest.requireActual("tests/orchestrator.email.js");

  return {
    __esModule: true,
    ...originalModule,
    deleteAllEmails: jest.fn(() => true),
    sendEmailUser: jest.fn(() => true),
    getEmails: jest.fn(() => {
      return [
        {
          id: 1,
          sender: "<team@example.com>",
          recipients: ["<alice@example.com>", "<bob@example.com>"],
          subject: "Último email enviado",
          size: "357",
          created_at: "2025-08-30T19:28:58+00:00",
          text: "Corpo do ultimo email enviado.\r\n",
        },

        {
          id: 2,
          sender: "<contato@modernsystems.com>",
          recipients: ["<resgistration.flow@teste.com>"],
          subject: "Ative o seu cadastro",
          size: "357",
          created_at: "2025-08-30T19:28:58+00:00",
          text: `RegistrationFlow, 

Segue link de ativação abaixo:\r\n
${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f-3c8d-46f9-3624cf8

Atenciosamente,
Equipe ModernSystems
`,
        },
      ];
    }),
    getEmailById: jest.fn(
      () =>
        `RegistrationFlow,\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f-3c8d-46f9-3624cf8\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    ),
  };
});
jest.mock("infra/email.js");
const findOneValidByToken = jest.fn(() => {
  return {
    id: "3c8d-46f9-3624cf8f-3c8d-46f9-3624cf8",
    used_at: null,
    user_id: "3624cf8f-3c8d-46f9-8e3c-64b3a0c61e1",
    expires_at: "2026-07-30T18:22:39.428Z",
    created_at: "2026-07-30T21:07:39.605Z",
    updated_at: "2026-07-30T21:07:39.605Z",
  };
});

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
  await deleteAllEmails();
});

describe("Mock - Use case: Resgistration Flow (all sucessful)", () => {
  let createUserBodyResponse;
  let newUser;
  let tokenActivation;
  let createdSessionResponseBody;

  test("Create user account", async () => {
    const fetch = jest.fn(async () => {
      return new Response(
        JSON.stringify({
          id: "3624cf8f-3c8d-46f9-8e3c-64b3a0c61e1",
          username: "RegistrationFlow",
          features: ["read:activation_token"],
          email: "resgistration.flow@teste.com",
          password:
            "2b$04$s2ArqnZSfB40/snqVLwuoO.On0wJJcENt/xnH0g0cPqdOSVcwlpRS",
        }),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    });

    const response = await fetch(`${webserver.origin}/api/v1/users`, {
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
    expect(createUserBodyResponse.features).toEqual(["read:activation_token"]);
    expect(createUserBodyResponse.email).toBe("resgistration.flow@teste.com");
    expect(createUserBodyResponse.password).toBe(
      createUserBodyResponse.password,
    );
  });

  test("Received activate email", async () => {
    //Mock
    const tokenActivation = {
      id: "3c8d-46f9-3624cf8f-3c8d-46f9-3624cf8",
      used_at: null,
      user_id: "3c7055c4-4b8b-418a-9737-80983fbb4e7c",
      expires_at: "2026-07-30T18:22:39.428Z",
      created_at: "2026-07-30T21:07:39.605Z",
      updated_at: "2026-07-30T21:07:39.605Z",
    };

    const lastEmail = await orchestrator.getLastEmail();

    const extractTokenEmailBody = orchestrator.extractUUID(lastEmail.text);
    const activationTokenObject = await findOneValidByToken(
      extractTokenEmailBody,
    );

    expect(extractTokenEmailBody).toBe(activationTokenObject.id);
    expect(activationTokenObject.user_id).toBe(createUserBodyResponse.id);
    expect(activationTokenObject.used_at).toBe(null);

    expect(getEmails.mock.calls[0][0]).toBe(undefined);
    expect(getEmails.mock.results[0].value).toEqual([
      {
        id: 1,
        sender: "<team@example.com>",
        recipients: ["<alice@example.com>", "<bob@example.com>"],
        subject: "Último email enviado",
        size: "357",
        created_at: "2025-08-30T19:28:58+00:00",
        text: "Corpo do ultimo email enviado.\r\n",
      },
    ]);

    expect(getEmailById.mock.calls[0][0]).toBe(2);
    expect(getEmailById.mock.results[0].value).toBe(
      `${createUserBodyResponse.username},\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/${tokenActivation.id}\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );

    expect(lastEmail.sender).toBe("<contato@modernsystems.com>");
    expect(lastEmail.recipients[0]).toBe("<resgistration.flow@teste.com>");
    expect(lastEmail.subject).toBe("Ative o seu cadastro");
    expect(lastEmail.text).toContain(`${createUserBodyResponse.username}`);
    expect(lastEmail.text).toContain(
      `${createUserBodyResponse.username},\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/${tokenActivation.id}\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );
  });

  test("Create a user account and activate token using functions instead of the http://localhost:3000/api/v1/users endpoint", async () => {
    newUser = await orchestrator.createUser({
      username: "RegistrationFlow",
      email: "resgistration.flow@teste.com",
      password: "ssss383832",
    });
    tokenActivation = await activation.create(newUser);

    const findToken = await activation.findOneByUserId(newUser.id);

    expect(tokenActivation.id).toBe(findToken.id);

    const saveTokenActivation = tokenActivation;

    //Mock
    tokenActivation = {
      id: "3c8d-46f9-3624cf8f-3c8d-46f9-3624cf8",
      used_at: null,
      user_id: "3c7055c4-4b8b-418a-9737-80983fbb4e7c",
      expires_at: "2026-07-30T18:22:39.428Z",
      created_at: "2026-07-30T21:07:39.605Z",
      updated_at: "2026-07-30T21:07:39.605Z",
    };

    await activation.sendEmailToUser(newUser, tokenActivation);

    expect(newUser.id).toBe(newUser.id);
    expect(newUser.username).toBe("RegistrationFlow");
    expect(String(newUser.features[0])).toBe("read:activation_token");
    expect(newUser.email).toBe("resgistration.flow@teste.com");
    expect(newUser.password).toBe(newUser.password);

    const lastEmail = await orchestrator.getLastEmail();

    const extractTokenEmailBody = orchestrator.extractUUID(lastEmail.text);
    const activationTokenObject = await findOneValidByToken(
      extractTokenEmailBody,
    );

    expect(extractTokenEmailBody).toBe(activationTokenObject.id);
    expect(activationTokenObject.user_id).toBe(createUserBodyResponse.id);
    expect(activationTokenObject.used_at).toBe(null);

    expect(getEmails.mock.calls[0][0]).toBe(undefined);
    expect(getEmails.mock.results[0].value).toEqual([
      {
        id: 1,
        sender: "<team@example.com>",
        recipients: ["<alice@example.com>", "<bob@example.com>"],
        subject: "Último email enviado",
        size: "357",
        created_at: "2025-08-30T19:28:58+00:00",
        text: "Corpo do ultimo email enviado.\r\n",
      },
    ]);

    expect(getEmailById.mock.calls[0][0]).toBe(2);
    expect(getEmailById.mock.results[0].value).toBe(
      `RegistrationFlow,\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/${tokenActivation.id}\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );

    expect(lastEmail.sender).toBe("<contato@modernsystems.com>");
    expect(lastEmail.recipients[0]).toBe("<resgistration.flow@teste.com>");
    expect(lastEmail.subject).toBe("Ative o seu cadastro");
    expect(lastEmail.text).toContain("RegistrationFlow");
    expect(lastEmail.text).toContain(
      `${newUser.username},\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/${tokenActivation.id}\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );

    //Teardown
    tokenActivation = saveTokenActivation;
  });

  test("Activate user", async () => {
    const activationResponse = await fetch(
      `${webserver.origin}/api/v1/activations/${tokenActivation.id}`,
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

    expect(activetedUser.features).toEqual([
      "create:session",
      "read:session",
      "update:user",
    ]);
  });

  test("Login", async () => {
    const createdSessionResponse = await fetch(
      `${webserver.origin}/api/v1/sessions`,
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

    expect(createdSessionResponse.status).toBe(201);

    createdSessionResponseBody = await createdSessionResponse.json();

    expect(createdSessionResponse.headers.get("set-cookie")).toBe(
      `session_id=${createdSessionResponseBody.token}; Max-Age=2592000; Path=/; HttpOnly; SameSite=Lax`,
    );
    expect(createdSessionResponseBody.user_id).toBe(newUser.id);
  });

  test("Get user information", async () => {
    const response = await fetch(`${webserver.origin}/api/v1/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${createdSessionResponseBody.token}`,
      },
    });

    expect(response.status).toBe(200);

    const responseBody = await response.json();

    expect(responseBody.id).toBe(newUser.id);
  });
});
