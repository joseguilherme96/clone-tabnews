import { Banner } from "@primer/react";
import DefaultLayout from "Interface/DefaultLayout";

export default function ConfirmRegisterPage() {
  return (
    <>
      <DefaultLayout
        contentWidth="small"
        metadados={{
          title: "Confirmar",
        }}
      >
        <Banner
          variant="warning"
          title="Falta só uma etapa !"
          description="Abra o email enviado por Modern Systems e clique no link de confirmação."
        ></Banner>
      </DefaultLayout>
    </>
  );
}
