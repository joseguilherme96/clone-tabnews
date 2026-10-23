import { Button, FormControl, Heading, Stack, TextInput } from "@primer/react";
import DefaultLayout from "Interface/DefaultLayout";
import { useState } from "react";

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
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    const requestBody = { username, email, password };

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
          <FormControl.Label>Nome de usuário</FormControl.Label>
          <TextInput
            type="text"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            block
          ></TextInput>
        </FormControl>
        <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            type="text"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            block
          ></TextInput>
        </FormControl>
        <FormControl>
          <FormControl.Label>Senha</FormControl.Label>
          <TextInput
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            block
          ></TextInput>
        </FormControl>
        <Button type="submit" variant="primary">
          Cadastrar
        </Button>
      </Stack>
    </form>
  );
}
