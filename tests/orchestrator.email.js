const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

export async function getEmails() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();

  return emailListBody;
}

export async function getEmailById(emailId) {
  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${emailId}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

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
  emailHttpUrl,
};

export default email;
