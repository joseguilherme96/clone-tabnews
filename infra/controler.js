import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
} from "infra/errors.js";

import session from "model/session";
import * as cookie from "cookie";
import user from "model/user";
import authorization from "model/authorization.js";

function onNoMatcherHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(405).json(publicErrorObject);
  console.log(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }

  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof ForbiddenError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObject = new InternalServerError({
    statusCode: error.statusCode,
    cause: error,
  });
  response.status(publicErrorObject.statusCode).json(publicErrorObject);

  console.log(
    "\n Erro dentro do onErrorHandle do next-connect dentro de infra/controler.js",
  );
  console.error(publicErrorObject);
}

function setSessionCookie(response, sessionToken) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRE_IN_MILISECONDS / 1000,
    secure: process.env.NODE_ENV == "production",
    httpOnly: true,
    sameSite: "lax",
  });
  response.setHeader("Set-Cookie", setCookie);
}

function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    maxAge: -1,
    secure: process.env.NODE_ENV == "production",
    httpOnly: true,
  });
  response.setHeader("Set-Cookie", setCookie);
}

function setCacheControl(response) {
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
}

async function injectAnonymousOrUser(request, response, next) {
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser(request);

    return next();
  }

  injectAnonymousUser(request);
  return next();
}

async function injectAuthenticatedUser(request) {
  const sessionToken = request.cookies?.session_id;

  const validSession = await session.findOneValidByToken(`${sessionToken}`);
  const userObject = await user.findOneById(validSession.user_id);

  request.context = {
    ...request.context,
    user: userObject,
  };
}

function injectAnonymousUser(request) {
  const anonymousUserObject = {
    features: ["read:activation_token", "create:session", "create:user"],
  };

  request.context = {
    ...request.context,
    user: anonymousUserObject,
  };
}

function canRequest(feature) {
  return function canRequestMiddleware(request, response, next) {
    const userTryingToRequest = request.context.user;

    if (authorization.can(userTryingToRequest, feature)) {
      return next();
    }

    throw new ForbiddenError({
      message: "Usuário não tem permissão para executar esta ação.",
      action: `Verifique se o seu usuário possui a feature ${feature}.`,
    });
  };
}

const controller = {
  errorHandlers: {
    onNoMatcherHandler: onNoMatcherHandler,
    onErrorHandler: onErrorHandler,
  },
  setSessionCookie: setSessionCookie,
  setCacheControl: setCacheControl,
  clearSessionCookie: clearSessionCookie,
  injectAnonymousOrUser: injectAnonymousOrUser,
  canRequest: canRequest,
};

export default controller;
