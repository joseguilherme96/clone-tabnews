import getText from "../../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";
import { Card, Stack } from "@primer/react/experimental";

function Version() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading ? data.dependencies.database.version : false;
  let text = getText(isLoading, value) ?? "-";

  return (
    <Stack.Item grow>
      <Card>
        <Card.Heading>PostgreSQL</Card.Heading>
        <Card.Description>{text}</Card.Description>
        <Card.Metadata>Versão em execução</Card.Metadata>
      </Card>
    </Stack.Item>
  );
}

export default Version;
