import { useState } from "react";
import { ValidationError } from "infra/errors";

export default function useValidator(valor, valueObject) {
  const [valorForm, setValor] = useState("");
  const [ehValido, setValido] = useState(false);
  const [response, setResponse] = useState(
    new ValidationError({
      message: "O campo não pode ficar vazio.",
      action: "Preencha o campo e tente novamente.",
    }),
  );
  const [showError, setShowError] = useState(false);

  function validar(valor) {
    try {
      new valueObject(valor);
      setValido(true);
    } catch (e) {
      if (e instanceof ValidationError) {
        setResponse({
          message: e.message,
          action: e.action,
        });
      }

      setValido(false);
      setShowError(true);
    } finally {
      setValor(valor);
    }
  }

  return [valorForm, validar, ehValido, response, showError, setShowError];
}
