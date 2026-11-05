import { ValidationError } from "infra/errors";

class EmailVO {
  constructor(email) {
    this.email = email;
    this.contain = "^[a-zA-Z0-9._+-]*@[a-zA-Z0-9]*\\..";

    if (typeof this.email !== "string") {
      throw new ValidationError({
        name: "ValidationError",
        message: "Email inválido.",
        action: `O email não foi definido.`,
        status_code: 400,
      });
    }

    const matchEmail = email.match(this.contain);

    if (this.email == "") {
      throw new ValidationError({
        name: "ValidationError",
        message: "Email inválido.",
        action: `O campo email não pode ficar em branco.`,
        status_code: 400,
      });
    }

    if (!matchEmail) {
      throw new ValidationError({
        name: "ValidationError",
        message: "Email inválido.",
        action: `O email cadastrado pode conter apenas estes caracteres: letras(a-z,A-Z), numeros(0-9), ponto(.), underline(_), mais(+) ou menos(-), `,
        status_code: 400,
      });
    }
  }
}

export default EmailVO;
