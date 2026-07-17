import { createRouter } from "next-connect";
import controller from "infra/controler";
import session from "model/session";
import user from "model/user";

const router = createRouter();

router.get(getHandler);

export default router.handler({
  onError: controller.errorHandlers.onErrorHandler,
  onNoMatch: controller.errorHandlers.onNoMatcherHandler,
});

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(response, renewedSessionObject.token);

  const userFound = await user.findOneById(renewedSessionObject.user_id);
  response.status(200).json(userFound);
}
