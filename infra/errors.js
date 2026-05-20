export class InternalServerError extends Error {
  constructor({ cause }) {
    super("Um erro interno não esperado aconteceu.", { cause });

    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = 500;

    console.info(
      "Dentro do constructor da classe `InternalServerError` do arquivo infra/errors.js",
    );
    console.error(cause);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
