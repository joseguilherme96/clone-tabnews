import controller from "infra/controler";
import { createRouter } from "next-connect";
import session from "model/session";
import authentication from "model/authentication";

const router = createRouter();
router.post(postHandler);
router.delete(deleteHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
  onNoMatch: controller.errorHandlers.onNoMatcherHandler,
});

async function postHandler(request, response) {
  const userInputValues = request.body;
  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInputValues.email,
    userInputValues.password,
  );
  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(response, newSession.token);
  controller.setCacheControl(response);

  response.status(201).json(newSession);
}

async function deleteHandler(request, response) {
  const token = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(token);
  const sessionDeleted = await session.expireById(sessionObject.id);
  controller.setCacheControl(response);
  controller.clearSessionCookie(response);

  response.status(200).json(sessionDeleted);
}
