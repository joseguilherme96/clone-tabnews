import orchestrator from "tests/orchestrator";
import {
  getEmails,
  getEmailById,
  deleteAllEmails,
} from "tests/orchestrator.email";
import activation, { findOneByUserId } from "model/activation.js";
import webserver from "infra/webserver";

const fetch = jest.fn(async () => {
  return new Response(
    JSON.stringify({
      id: "3624cf8f-3c8d-46f9-8e3c-64b3a0c61e1",
      username: "RegistrationFlow",
      features: ["read:activation_token"],
      email: "resgistration.flow@teste.com",
      password: "2b$04$s2ArqnZSfB40/snqVLwuoO.On0wJJcENt/xnH0g0cPqdOSVcwlpRS",
    }),
    {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
});
jest.mock("model/activation.js", () => {
  const originalModule = jest.requireActual("model/activation.js");

  return {
    __esModule: true,
    ...originalModule,
    findOneByUserId: jest.fn(() => {
      return {
        id: "3c8d-46f9-3624cf8f",
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
${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f

Atenciosamente,
Equipe ModernSystems
`,
        },
      ];
    }),
    getEmailById: jest.fn(
      () =>
        `RegistrationFlow,\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    ),
  };
});
jest.mock("infra/email.js");

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.cleanDataBase();
  await orchestrator.runPendingMigrations();
  await deleteAllEmails();
});

describe("Mock - Use case: Resgistration Flow (all sucessful)", () => {
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
    const tokenActivation = await findOneByUserId(createUserBodyResponse.id);

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
      `${createUserBodyResponse.username},\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );

    expect(lastEmail.sender).toBe("<contato@modernsystems.com>");
    expect(lastEmail.recipients[0]).toBe("<resgistration.flow@teste.com>");
    expect(lastEmail.subject).toBe("Ative o seu cadastro");
    expect(lastEmail.text).toContain(`${createUserBodyResponse.username}`);
    expect(lastEmail.text).toContain(tokenActivation.id);
    expect(lastEmail.text).toContain(
      `${createUserBodyResponse.username},\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );
  });

  test("Create a user account and activate token using functions instead of the http://localhost:3000/api/v1/users endpoint", async () => {
    const newUser = await orchestrator.createUser({
      username: "RegistrationFlow",
      email: "resgistration.flow@teste.com",
      password: "ssss383832",
    });
    const tokenActivation = await activation.create(newUser);
    const findToken = await activation.findOneByUserId(newUser.id);

    expect(tokenActivation.id).toBe(findToken.id);

    await activation.sendEmailToUser(newUser, tokenActivation);

    expect(newUser.id).toBe(newUser.id);
    expect(newUser.username).toBe("RegistrationFlow");
    expect(String(newUser.features[0])).toBe("read:activation_token");
    expect(newUser.email).toBe("resgistration.flow@teste.com");
    expect(newUser.password).toBe(newUser.password);

    const email = await orchestrator.getLastEmail();

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
      `RegistrationFlow,\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );

    expect(email.sender).toBe("<contato@modernsystems.com>");
    expect(email.recipients[0]).toBe("<resgistration.flow@teste.com>");
    expect(email.subject).toBe("Ative o seu cadastro");
    expect(email.text).toContain("RegistrationFlow");
    expect(email.text).toContain(
      `${newUser.username},\r\n\nSegue link de ativação abaixo:\r\n${webserver.origin}/cadastro/ativar/3c8d-46f9-3624cf8f\r\n\nAtenciosamente,\r\nEquipe ModernSystems\n`,
    );
  });
});
