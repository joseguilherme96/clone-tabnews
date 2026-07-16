import controller from "infra/controler";
import { createRouter } from "next-connect";
import session from "model/session";
import authentication from "model/authentication";
import * as cookie from "cookie";

const router = createRouter();
router.post(postHandler);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );
  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(response,newSession.token);
  await response.status(201).json(newSession);
}

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
  onNoMatch: controller.errorHandlers.onNoMatcherHandler,
});
