import migrator from "model/migrator.js";
import { createRouter } from "next-connect";
import controller from "infra/controler.js";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler({
  onNoMatch: controller.errorHandlers.onNoMatcherHandler,
  onError: controller.errorHandlers.onErrorHandler,
});

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migratedMigrations = await migrator.runPendingMigrations();

  if (migratedMigrations.length > 0) {
    return response.status(201).json(migratedMigrations);
  }

  return response.status(200).json(migratedMigrations);
}
