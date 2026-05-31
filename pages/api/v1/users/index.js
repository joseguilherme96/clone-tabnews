import create from "model/user.js";
import { createRouter } from "next-connect";
import controller from "infra/controler";

const router = createRouter();

router.post(postHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
});

async function postHandler(request, response) {
  const inputCreateUser = request.body;

  console.log(inputCreateUser);
  const user = await create(inputCreateUser);

  await response.status(201).json(user);
}
