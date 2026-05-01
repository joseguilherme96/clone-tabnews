import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import getText from "../../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";

function MaxConnections() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading ? data.dependencies.database.max_connections : false;
  let text = getText(isLoading, value);

  return <StatusDataBaseMarginLeft descricao="Max Connetions" value={text} />;
}

export default MaxConnections;
