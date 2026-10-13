import Head from "next/head";
import { Header, PageLayout, Text } from "@primer/react";
import styles from "./index.module.css";

const contentWidthClasses = {
  small: styles.smallContent,
};

export default function DefaultLayout({
  children,
  metadados = {},
  contentWidth,
}) {
  const extraContentClassName = contentWidthClasses[contentWidth];

  return (
    <>
      <Head>
        <title>
          {metadados.title
            ? `${metadados.title} · Modern Systems`
            : "Modern Systems"}
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
        <PageLayout.Content
          width={contentWidth}
          className={extraContentClassName}
        >
          {children}
        </PageLayout.Content>
      </PageLayout>
      <PageLayout.Footer divider="line">
        <Text size="small">© {new Date().getFullYear()} Modern Systems</Text>
      </PageLayout.Footer>
    </>
  );
}
