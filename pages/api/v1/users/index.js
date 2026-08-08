import user from "model/user.js";
import { createRouter } from "next-connect";
import controller from "infra/controler";
import activation from "model/activation.js";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
});

async function postHandler(request, response) {
  const inputCreateUser = request.body;

  const newUser = await user.create(inputCreateUser);

  const tokenActivation = await activation.create(newUser);
  await activation.sendEmailToUser(newUser, tokenActivation);

  await response.status(201).json(newUser);
}
