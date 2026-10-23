import getText from "../../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";
import { Card, Stack } from "@primer/react/experimental";

function MaxConnections() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading ? data.dependencies.database.max_connections : false;
  let text = getText(isLoading, value);

  return (
    <Stack.Item grow>
      <Card>
        <Card.Heading>Conexões Máximas</Card.Heading>
        <Card.Description>{text}</Card.Description>
        <Card.Metadata>Conexões disponíveis</Card.Metadata>
      </Card>
    </Stack.Item>
  );
}

export default MaxConnections;
