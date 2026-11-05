import UpdatedAt from "../../components/Status/UpdatedAt";
import DataBase from "../../components/Status/DataBase/DataBase";
import DefaultLayout from "Interface/DefaultLayout";
import { Heading, Stack } from "@primer/react";

export default function StatusPage() {
  return (
    <DefaultLayout contentWidth="medium" metadados={{ title: "Status" }}>
      <Stack gap="spacious">
        <Heading as="h1">Status</Heading>
        <DataBase />
        <UpdatedAt />
      </Stack>
    </DefaultLayout>
  );
}
