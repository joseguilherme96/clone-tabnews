import Head from "next/head";
import { Header, PageLayout, Text } from "@primer/react";

export default function DefaultLayout({ children, metadados = {} }) {
  return (
    <>
      <Head>
        <title>
          {metadados.title
            ? `${metadados.title} · Modern Systems`
            : "Modern Systems"}{" "}
        </title>
        {metadados.description && (
          <meta name="description" value={metadados.description} />
        )}
      </Head>
      <Header>
        <Header.Item full>
          <Header.Link href="/">Modern Systems</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/login">Login</Header.Link>
        </Header.Item>
        <Header.Item>
          <Header.Link href="/cadastro">Cadastrar</Header.Link>
        </Header.Item>
      </Header>
      <PageLayout>
        <PageLayout.Content>{children}</PageLayout.Content>
        <PageLayout.Footer divider="line">
          <Text size="small">© {new Date().getFullYear()} Modern Systems</Text>
        </PageLayout.Footer>
      </PageLayout>
    </>
  );
}
