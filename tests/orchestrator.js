import retry from "async-retry";
import database from "infra/database";
import migrator from "model/migrator.js";
import user from "model/user";
import { faker } from "@faker-js/faker";

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

async function cleanDataBase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace("/[_.-]/g", ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "sss",
  });
}

const orchestrator = {
  waitForAllServices: waitForAllServices,
  cleanDataBase: cleanDataBase,
  runPendingMigrations: runPendingMigrations,
  createUser: createUser,
};

export default orchestrator;
