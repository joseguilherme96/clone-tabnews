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

function setSessionCookie(response,sessionToken){

  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRE_IN_MILISECONDS / 1000,
    secure: process.env.NODE_ENV == "production",
    httpOnly: true,
  });
  response.setHeader("Set-Cookie", setCookie);

}

const controller = {
  errorHandlers: {
    onNoMatcherHandler: onNoMatcherHandler,
    onErrorHandler: onErrorHandler
  },
  setSessionCookie : setSessionCookie,
};

export default controller;
