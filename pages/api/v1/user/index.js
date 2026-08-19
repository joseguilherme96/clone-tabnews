import { createRouter } from "next-connect";
import controller from "infra/controler";
import session from "model/session";
import user from "model/user";
import authorization from "model/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
  onNoMatch: controller.errorHandlers.onNoMatcherHandler,
});

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  const userFound = await user.findOneById(renewedSessionObject.user_id);

  controller.setSessionCookie(response, renewedSessionObject.token);
  controller.setCacheControl(response);

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    userFound,
  );

  response.status(200).json(secureOutputValues);
}
