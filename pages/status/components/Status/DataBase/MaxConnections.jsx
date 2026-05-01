import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import useSWRFecthAPIStatus from "../../../services/useSWRFecthAPIStatus";
import getText from "../../../utils/getText";

function MaxConnections() {
  const { isLoading, data } = useSWRFecthAPIStatus();

  let value = !isLoading ? data.dependencies.database.max_connections : false;
  let text = getText(isLoading, value);

  return <StatusDataBaseMarginLeft descricao="Max Connetions" value={text} />;
}

export default MaxConnections;
