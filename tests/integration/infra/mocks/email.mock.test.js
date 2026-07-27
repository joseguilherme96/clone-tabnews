import { send } from "infra/email.js";
import orchestrator, { waitForAllServices } from "tests/orchestrator.js";
import {
  deleteAllEmails,
  getEmails,
  getEmailById,
} from "tests/orchestrator.email.js";

jest.mock("infra/email.js", () => {
  const originalModule = jest.requireActual("infra/email.js");
  return {
    __esModule: true,
    ...originalModule,
    send: jest.fn(() => true),
  };
});

jest.mock("tests/orchestrator.email.js", () => {
  const originalModule = jest.requireActual("tests/orchestrator.email.js");
  return {
    __esModule: true,
    ...originalModule,
    deleteAllEmails: jest.fn(() => true),
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
          sender: "<team@example.com>",
          recipients: ["<alice@example.com>", "<bob@example.com>"],
          subject: "Último email enviado",
          size: "357",
          created_at: "2025-08-30T19:28:58+00:00",
          text: "Corpo do ultimo email enviado.\r\n",
        },
      ];
    }),
    getEmailById: jest.fn(() => {
      return "Corpo do ultimo email enviado.\r\n";
    }),
  };
});

jest.mock("tests/orchestrator.js", () => {
  const originalModule = jest.requireActual("tests/orchestrator.js");

  return {
    __esModule: true,
    ...originalModule,
    waitForAllServices: jest.fn(() => true),
  };
});

beforeAll(async () => {
  await waitForAllServices();
});

describe("infra/email.test.js", () => {
  test("send()", async () => {
    await deleteAllEmails();

    await send({
      from: '"Example Team" <team@example.com>',
      to: "alice@example.com, bob@example.com",
      subject: "Hello",
      text: "Hello world?",
    });

    await send({
      from: '"Example Team" <team@example.com>',
      to: "alice@example.com, bob@example.com",
      subject: "Último email enviado",
      text: "Corpo do ultimo email enviado.",
    });

    expect(send.mock.calls[0][0]).toEqual({
      from: '"Example Team" <team@example.com>',
      to: "alice@example.com, bob@example.com",
      subject: "Hello",
      text: "Hello world?",
    });
    expect(send.mock.calls[1][0]).toEqual({
      from: '"Example Team" <team@example.com>',
      to: "alice@example.com, bob@example.com",
      subject: "Último email enviado",
      text: "Corpo do ultimo email enviado.",
    });
    expect(send.mock.results[0].value).toBe(true);

    const lastEmail = await orchestrator.getLastEmail();

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
    expect(getEmails.mock.calls[0].length).toBe(0);
    expect(getEmails.mock.calls[0][0]).toBe(undefined);

    expect(getEmailById.mock.results[0].value).toBe(
      "Corpo do ultimo email enviado.\r\n",
    );
    expect(getEmailById.mock.calls[0].length).toBe(1);
    expect(getEmailById.mock.calls[0][0]).toBe(2);

    expect(lastEmail.id).toBe(2);
    expect(lastEmail.sender).toBe("<team@example.com>");
    expect(lastEmail.recipients[0]).toBe("<alice@example.com>");
    expect(lastEmail.recipients[1]).toBe("<bob@example.com>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.size).toBe("357");
    expect(lastEmail.text).toBe("Corpo do ultimo email enviado.\r\n");
  });
});
