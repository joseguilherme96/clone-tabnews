import { useState } from "react";
import { ValidationError } from "infra/errors";

export default function useStateValidator(fieldValue, valueObject) {
  const [value, setValue] = useState(fieldValue);
  const [error, setError] = useState(null);

  function validate(fieldValue) {
    try {
      new valueObject(fieldValue);
      setError(null);
      return true;
    } catch (e) {
      if (!(e instanceof ValidationError)) {
        setError({
          message: "Ocorreu um erro interno desconhecido.",
          action: "Por favor contate o suporte.",
        });
        return false;
      }

      setError({
        message: e.message,
        action: e.action,
      });
    } finally {
      setValue(fieldValue);
    }
  }

  return [value, validate, error !== null, error];
}
