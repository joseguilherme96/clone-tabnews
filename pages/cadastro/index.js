import { Button, FormControl, Heading, Stack, TextInput } from "@primer/react";
import DefaultLayout from "Interface/DefaultLayout";
import { useState } from "react";
import PasswordVO from "domain/value_object/password.js";
import EmailVO from "domain/value_object/email";
import UsernameVO from "domain/value_object/username.js";
import useValidator from "hooks/useValidator.js";

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
  const [
    username,
    setUsername,
    usernameIsValid,
    UsernameVOError,
    showUsernameError,
    setShowUsernameError,
  ] = useValidator("", UsernameVO);
  const [
    password,
    setPassword,
    passwordIsValid,
    PasswordVOError,
    showPasswordError,
    setShowPasswordError,
  ] = useValidator("", PasswordVO);

  const [
    email,
    setEmail,
    emailIsValid,
    EmailVOError,
    showEmailError,
    setShowEmailError,
  ] = useValidator("", EmailVO);
  const [isLoading, setLoading] = useState(false);
  const label = { display: "flex", alignItems: "center" };

  async function handleSubmit(event) {
    event.preventDefault();

    email == "" && setShowEmailError(true);
    password == "" && setShowPasswordError(true);
    username == "" && setShowUsernameError(true);

    if (!passwordIsValid || !emailIsValid || !usernameIsValid) {
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
            style={{
              border: usernameIsValid ? "green solid 1px" : "none",
              borderRadius: "0.3rem",
            }}
          ></TextInput>
          <ErrorMessage
            data={{
              isValid: usernameIsValid,
              showError: showUsernameError,
              message: UsernameVOError.message,
              action: UsernameVOError.action,
            }}
          />
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
            style={{
              border: emailIsValid ? "green solid 1px" : "none",
              borderRadius: "0.3rem",
            }}
          ></TextInput>
          <ErrorMessage
            data={{
              isValid: emailIsValid,
              showError: showEmailError,
              message: EmailVOError.message,
              action: EmailVOError.action,
            }}
          />
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
            style={{
              border: passwordIsValid ? "green solid 1px" : "none",
              borderRadius: "0.3rem",
            }}
          ></TextInput>
          <ErrorMessage
            data={{
              isValid: passwordIsValid,
              showError: showPasswordError,
              message: PasswordVOError.message,
              action: PasswordVOError.action,
            }}
          />
        </FormControl>
        <Button type="submit" variant="primary" disabled={isLoading}>
          Cadastrar
        </Button>
      </Stack>
    </form>
  );
}

function ErrorMessage({ data = {} }) {
  return (
    <>
      {!data.isValid && data.showError && (
        <FormControl.Validation variant="error">
          {data.message} {data.action}
        </FormControl.Validation>
      )}
    </>
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
