import controller from "infra/controler";
import { createRouter } from "next-connect";
import session from "model/session";
import authentication from "model/authentication";
import authorization from "model/authorization";
import { ForbiddenError } from "infra/errors";

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest("create:session"), postHandler)
  .delete(deleteHandler)
  .handler({
    onError: controller.errorHandlers.onErrorHandler,
    onNoMatch: controller.errorHandlers.onNoMatcherHandler,
  });

async function postHandler(request, response) {
  const userInputValues = request.body;
  const authenticatedUser = await authentication.getUser(
    userInputValues.email,
    userInputValues.password,
  );

  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Usuário não tem permissão para fazer um login.",
      action: "Contate o suporte caso você acredite que isto seja um erro.",
    });
  }

  const newSession = await session.create(authenticatedUser);

  controller.setSessionCookie(response, newSession.token);
  controller.setCacheControl(response);

  console.log(authenticatedUser);
  const secureOutputValues = authorization.filterOutput(
    authenticatedUser,
    "read:session",
    newSession,
  );

  response.status(201).json(secureOutputValues);
}

async function deleteHandler(request, response) {
  const token = request.cookies.session_id;
  const userTryingToDelete = request.context.user;

  const sessionObject = await session.findOneValidByToken(token);
  const sessionDeleted = await session.expireById(sessionObject.id);
  controller.setCacheControl(response);
  controller.clearSessionCookie(response);

  const secureOutputValues = authorization.filterOutput(
    userTryingToDelete,
    "read:session",
    sessionDeleted,
  );

  response.status(200).json(secureOutputValues);
}
