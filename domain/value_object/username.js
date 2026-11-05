import { ValidationError } from "infra/errors";

class UsernameVO {
  constructor(username) {
    this.contain = "^[a-zA-Z0-9]+$";
    this.username = username;
    this.min = 8;
    this.max = 30;

    if (typeof this.username !== "string") {
      throw new ValidationError({
        name: "ValidationError",
        message: "Usuário inválido.",
        action: `O username não foi definido.`,
        status_code: 400,
      });
    }

    this.matchUsername = this.username.match(this.contain);

    if (this.username == "") {
      throw new ValidationError({
        name: "ValidationError",
        message: "Usuário inválido.",
        action: `O campo do usuário não pode ficar em branco.`,
        status_code: 400,
      });
    }

    if (this.username.length < this.min) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Usuário inválido.",
        action: `O usuário deve ser maior ou igual a ${this.min} caracteres.`,
        status_code: 400,
      });
    }

    if (this.username.length > this.max) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Usuário inválido.",
        action: `O usuário deve ser menor ou igual a ${this.max} caracteres.`,
        status_code: 400,
      });
    }

    if (!this.matchUsername) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Usuário inválido.",
        action: `O usuário cadastrado pode conter apenas estes caracteres: letras(a-z,A-Z), numeros(0-9). `,
        status_code: 400,
      });
    }
  }
}

export default UsernameVO;
