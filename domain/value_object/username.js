import { ValidationError } from "infra/errors";

class UsernameVO {
  constructor(username) {
    this.contain = "^[a-zA-Z0-9]+$";
    this.username = username;
    this.min = 8;
    this.max = 30;
    this.matchUsername = this.username.match(this.contain);

    if (this.username.length < this.min) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Usuário inválido.",
        action: `O usuário deve ser maior ou igual a 10 caracteres.`,
        status_code: 400,
      });
    }

    if (this.username.length > this.max) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Usuário inválido.",
        action: `O usuário deve ser menor ou igual a 30 caracteres.`,
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
