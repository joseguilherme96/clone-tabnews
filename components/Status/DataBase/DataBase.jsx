import Version from "./Version";
import MaxConnections from "./MaxConnections";
import OpenedConnetions from "./OpenedConnetions";
import { Heading, Stack } from "@primer/react";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";

function DataBase() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  if (isLoading || !data) {
    return;
  }

  return (
    <Stack>
      <Heading as="h2" variant="medium">
        Database
      </Heading>
      <Stack direction={{ narrow: "vertical", regular: "horizontal" }}>
        <OpenedConnetions />
        <MaxConnections />
        <Version />
      </Stack>
    </Stack>
  );
}

export default DataBase;
