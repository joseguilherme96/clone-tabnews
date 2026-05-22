import { InternalServerError, MethodNotAllowedError } from "infra/errors.js";

function onNoMatcherHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(405).json(publicErrorObject);
  console.log(publicErrorObject);
}

function onErrorHandler(error, request, response) {
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

const controller = {
  errorHandlers: {
    onNoMatcherHandler: onNoMatcherHandler,
    onErrorHandler: onErrorHandler,
  },
};

export default controller;
