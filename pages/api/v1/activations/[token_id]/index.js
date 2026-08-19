import { createRouter } from "next-connect";
import controller from "infra/controler";
import activation from "model/activation";
import user from "model/user";
import authorization from "model/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
  onNoMatch: controller.errorHandlers.onNoMatcherHandler,
});

async function patchHandler(request, response) {
  const token = request.query.token_id;
  const userTryingToPatch = request.context.user;

  await user.userCanActivateToken(token);

  const validActivationToken = await activation.findOneValidByToken(token);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedAtivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  const secureOutputValues = authorization.filterOutput(
    userTryingToPatch,
    "read:activation_token",
    usedAtivationToken,
  );

  response.status(200).json(secureOutputValues);
}
