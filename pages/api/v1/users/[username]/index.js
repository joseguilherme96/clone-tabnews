import user from "model/user.js";
import { createRouter } from "next-connect";
import controller from "infra/controler";

const router = createRouter();

router.get(getHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
});

async function getHandler(request, response) {
  const username = request.query.username;
  const findOneUserByUsername = await user.findOneByUsername(username);
  await response.status(200).json(findOneUserByUsername);
}
