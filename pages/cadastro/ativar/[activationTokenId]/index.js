import { Banner } from "@primer/react";
import DefaultLayout from "Interface/DefaultLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Ativar() {
  const router = useRouter();
  const activationTokenId = router.query.activationTokenId;

  const [status, setActivationStatus] = useState("loading");
  const [message, setErrorMessage] = useState("");

  useEffect(() => {
    if (!activationTokenId) {
      return;
    }

    setTimeout(() => {
      sendActivationRequest();
    }, 1000);

    async function sendActivationRequest() {
      try {
        const response = await fetch(
          `/api/v1/activations/${activationTokenId}`,
          {
            method: "PATCH",
          },
        );

        const responseBody = await response.json();

        if (response.status === 200) {
          setActivationStatus("success");
          return;
        }

        setActivationStatus("failure");
        setErrorMessage(`${responseBody.message} ${responseBody.action}`);
      } catch {
        setActivationStatus("failure");
        setErrorMessage("Falha na comunicação com o servidor.");
      }
    }
  }, [activationTokenId]);

  return (
    <DefaultLayout
      contentWidth="small"
      metadados={{
        title: "Ativar",
        description: "Ativar cadastro.",
      }}
    >
      {status === "loading" && (
        <Banner variant="info">
          <Banner.Title>Verificando token....</Banner.Title>
        </Banner>
      )}
      {status === "success" && (
        <Banner variant="success">
          <Banner.Title>Cadastro ativado com sucesso !</Banner.Title>
          <Banner.Description>
            Sua conta já está ativa e você já pode{" "}
            {<a href="/login">fazer o login</a>}.
          </Banner.Description>
        </Banner>
      )}

      {status === "failure" && (
        <Banner variant="critical">
          <Banner.Title>Não foi possível ativar seu cadastro.</Banner.Title>
          <Banner.Description>{message}</Banner.Description>
        </Banner>
      )}
    </DefaultLayout>
  );
}
