import {
  InternalServerError,
  MethodNotAllowedError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors.js";

import session from "model/session";
import * as cookie from "cookie";

function onNoMatcherHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(405).json(publicErrorObject);
  console.log(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
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

const controller = {
  errorHandlers: {
    onNoMatcherHandler: onNoMatcherHandler,
    onErrorHandler: onErrorHandler,
  },
  setSessionCookie: setSessionCookie,
  setCacheControl: setCacheControl,
  clearSessionCookie: clearSessionCookie,
};

export default controller;
