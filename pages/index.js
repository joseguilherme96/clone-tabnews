import DefaultLayout from "Interface/DefaultLayout";

function Home() {
  return (
    <DefaultLayout
      metadados={{
        description: "Softwares que geram valor para o seu negócio.",
      }}
    >
      <h1>Softwares que geram valor para o seu negócio.</h1>
    </DefaultLayout>
  );
}

export default Home;
