import getText from "../../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";
import { Card, Stack } from "@primer/react/experimental";

function OpenedConnetions() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading ? data.dependencies.database.opened_connetions : false;
  let text = getText(isLoading, value);

  return (
    <Stack.Item grow>
      <Card>
        <Card.Heading>Conexões Abertas</Card.Heading>
        <Card.Description>{text}</Card.Description>
        <Card.Metadata>Uso neste instante</Card.Metadata>
      </Card>
    </Stack.Item>
  );
}

export default OpenedConnetions;
