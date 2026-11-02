import { ValidationError } from "infra/errors";

class EmailVO {
  constructor(email) {
    this.contain = "^[a-zA-Z0-9._+-]*@[a-zA-Z0-9]*\\..";

    const matchEmail = email.match(this.contain);

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
