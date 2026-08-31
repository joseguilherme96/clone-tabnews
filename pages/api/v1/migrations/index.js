import migrator from "model/migrator.js";
import { createRouter } from "next-connect";
import controller from "infra/controler.js";
import authorization from "model/authorization";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:migration"), getHandler)
  .post(controller.canRequest("create:migration"), postHandler)
  .handler({
    onNoMatch: controller.errorHandlers.onNoMatcherHandler,
    onError: controller.errorHandlers.onErrorHandler,
  });

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const pendingMigrations = await migrator.listPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    pendingMigrations,
  );
  response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  const userTryingToGet = request.context.user;
  const migratedMigrations = await migrator.runPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "create:migration",
    migratedMigrations,
  );

  if (migratedMigrations.length > 0) {
    return response.status(201).json(secureOutputValues);
  }

  return response.status(200).json(secureOutputValues);
}
