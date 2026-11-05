import { Button, FormControl, Heading, Stack, TextInput } from "@primer/react";
import DefaultLayout from "Interface/DefaultLayout";
import { useState } from "react";
import PasswordVO from "domain/value_object/password.js";
import EmailVO from "domain/value_object/email";
import UsernameVO from "domain/value_object/username.js";
import useStateValidator from "hooks/useStateValidator";

export default function RegisterPage() {
  return (
    <DefaultLayout
      contentWidth="small"
      metadados={{
        title: "Cadastro",
        description: "Crie sua conta de forma gratuita.",
      }}
    >
      <Stack gap="spacious" align="center">
        <Heading as="h1">Cadastro</Heading>
      </Stack>
      <RegisterForm />
    </DefaultLayout>
  );
}

function RegisterForm() {
  const [username, setUsername, usernameHasError, UsernameVOError] =
    useStateValidator("", UsernameVO);
  const [password, setPassword, passwordHasError, PasswordVOError] =
    useStateValidator("", PasswordVO);

  const [email, setEmail, emailHasError, EmailVOError] = useStateValidator(
    "",
    EmailVO,
  );

  const border = {
    border: "green solid 1px",
    borderRadius: "0.3rem",
  };

  const [isLoading, setLoading] = useState(false);

  const label = { display: "flex", alignItems: "center" };

  const emailIsValid = !emailHasError && email;
  const passwordIsValid = !passwordHasError && password;
  const usernameIsValid = !usernameHasError && username;

  async function handleSubmit(event) {
    event.preventDefault();

    email == "" && setEmail(email);
    password == "" && setPassword(password);
    username == "" && setUsername(username);

    if (!emailIsValid || !passwordIsValid || !usernameIsValid) {
      return;
    }

    const requestBody = { username, email, password };

    setLoading(true);

    const response = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (response.status === 201) {
      location.href = "/cadastro/confirmar";
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <FormControl>
          <FormControl.Label style={label}>
            Nome de usuário
            <FieldIsValid fieldIsValid={usernameIsValid} />
          </FormControl.Label>
          <TextInput
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            block
            style={usernameIsValid ? border : {}}
          ></TextInput>

          {usernameHasError && (
            <FormControl.Validation variant="error">
              {UsernameVOError?.message} {UsernameVOError?.action}
            </FormControl.Validation>
          )}
        </FormControl>
        <FormControl>
          <FormControl.Label style={label}>
            Email
            <FieldIsValid fieldIsValid={emailIsValid} />
          </FormControl.Label>
          <TextInput
            type="text"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            block
            style={emailIsValid ? border : {}}
          ></TextInput>
          {emailHasError && (
            <FormControl.Validation variant="error">
              {EmailVOError?.message} {EmailVOError?.action}
            </FormControl.Validation>
          )}
        </FormControl>
        <FormControl>
          <FormControl.Label style={label}>
            Senha
            <FieldIsValid fieldIsValid={passwordIsValid}></FieldIsValid>
          </FormControl.Label>
          <TextInput
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            block
            style={passwordIsValid ? border : {}}
          ></TextInput>
          {passwordHasError && (
            <FormControl.Validation variant="error">
              {PasswordVOError?.message} {PasswordVOError?.action}
            </FormControl.Validation>
          )}
        </FormControl>
        <Button type="submit" variant="primary" disabled={isLoading}>
          Cadastrar
        </Button>
      </Stack>
    </form>
  );
}

function FieldIsValid({ fieldIsValid }) {
  return (
    <>
      {fieldIsValid && (
        <FormControl.Validation
          variant="success"
          style={{ marginLeft: "0.2rem" }}
        ></FormControl.Validation>
      )}
    </>
  );
}
