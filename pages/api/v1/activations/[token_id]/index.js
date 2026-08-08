import { createRouter } from "next-connect";
import controller from "infra/controler";
import activation from "model/activation";
import user from "model/user";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
  onNoMatch: controller.errorHandlers.onNoMatcherHandler,
});

async function patchHandler(request, response) {
  const token = request.query.token_id;

  await user.userCanActivateToken(token);

  const validActivationToken = await activation.findOneValidByToken(token);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedAtivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  response.status(200).json(usedAtivationToken);
}
