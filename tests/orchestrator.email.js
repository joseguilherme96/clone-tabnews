import { emailHttpUrl } from "infra/email.js";

async function getEmails() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();

  return emailListBody;
}

async function getEmailById(emailId) {
  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${emailId}.plain`,
  );
  const emailTextBody = await emailTextResponse.json();

  return emailTextBody;
}

async function deleteAllEmails() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: "DELETE",
  });
}

const email = {
  getEmails,
  getEmailById,
  deleteAllEmails,
};

export default email;
