import { ValidationError } from "infra/errors";

class PasswordVO {
  constructor(password) {
    this.minimumPasswordLength = 8;
    this.maxPasswordLength = 30;

    if (password.length < this.minimumPasswordLength) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Senha muito curta.",
        action: `A senha deve ser igual ou maior que ${this.minimumPasswordLength} caracteres.`,
        status_code: 400,
      });
    }

    if (password.length > this.maxPasswordLength) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Senha muito longa.",
        action: `A senha deve ser igual ou menor que ${this.maxPasswordLength} caracteres.`,
        status_code: 400,
      });
    }
  }
}

export default PasswordVO;
