import user from "model/user.js";
import { createRouter } from "next-connect";
import controller from "infra/controler";
import authorization from "model/authorization";
import { ForbiddenError } from "infra/errors";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
});

async function getHandler(request, response) {
  const username = request.query.username;
  const findOneUserByUsername = await user.findOneByUsername(username);
  await response.status(200).json(findOneUserByUsername);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const userTryingToRequest = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryingToRequest, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário.",
    });
  }

  const updatedUser = await user.update(username, userInputValues);
  await response.status(201).json(updatedUser);
}
