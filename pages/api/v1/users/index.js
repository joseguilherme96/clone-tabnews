import user from "model/user.js";
import { createRouter } from "next-connect";
import controller from "infra/controler";
import activation from "model/activation.js";
import authorization from "model/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
});

async function postHandler(request, response) {
  const inputCreateUser = request.body;
  const userTryingToPost = request.context.user;

  const newUser = await user.create(inputCreateUser);

  const tokenActivation = await activation.create(newUser);
  await activation.sendEmailToUser(newUser, tokenActivation);

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    newUser,
  );

  await response.status(201).json(secureOutputValues);
}
