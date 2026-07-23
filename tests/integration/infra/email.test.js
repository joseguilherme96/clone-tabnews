import orchestrator from "tests/orchestrator.js";
import orchestratorEmail from "tests/orchestrator.email.js";
import email from "infra/email.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.test.js", () => {
  test("send()", async () => {
    await orchestratorEmail.deleteAllEmails();

    await email.send({
      from: '"Example Team" <team@example.com>',
      to: "alice@example.com, bob@example.com",
      subject: "Hello",
      text: "Hello world?",
    });

    await email.send({
      from: '"Example Team" <team@example.com>',
      to: "alice@example.com, bob@example.com",
      subject: "Último email enviado",
      text: "Corpo do ultimo email enviado.",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.id).toBe(2);
    expect(lastEmail.sender).toBe("<team@example.com>");
    expect(lastEmail.recipients[0]).toBe("<alice@example.com>");
    expect(lastEmail.recipients[1]).toBe("<bob@example.com>");
    expect(lastEmail.subject).toBe("Último email enviado");
    expect(lastEmail.size).toBe("357");
    expect(lastEmail.text).toBe("Corpo do ultimo email enviado.\n");
  });
});
