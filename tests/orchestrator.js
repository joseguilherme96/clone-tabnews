import retry from "async-retry";
import database from "infra/database";
import migrator from "model/migrator.js";
import user from "model/user";
import { faker } from "@faker-js/faker";
import session from "model/session";
import { getEmails, getEmailById } from "tests/orchestrator.email.js";
import { emailHttpUrl } from "infra/email.js";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch("http://localhost:3000/api/v1/status");

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function waitForEmailServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(emailHttpUrl);

      if (response.status !== 200) {
        throw Error();
      }
    }
  }
}

async function cleanDataBase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject?.username || faker.internet.username().replace("/[_.-]/g", ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "sss",
  });
}

async function createSession(user_id) {
  return await session.create(user_id);
}

async function getLastEmail() {
  const emails = await getEmails();
  const lastEmailItem = emails.pop();

  const emailTextBody = await getEmailById(lastEmailItem.id);
  lastEmailItem.text = emailTextBody.text;

  return lastEmailItem;
}

const orchestrator = {
  waitForAllServices: waitForAllServices,
  waitForEmailServices: waitForEmailServices,
  cleanDataBase: cleanDataBase,
  runPendingMigrations: runPendingMigrations,
  createUser: createUser,
  createSession: createSession,
  getLastEmail: getLastEmail,
};

export default orchestrator;
