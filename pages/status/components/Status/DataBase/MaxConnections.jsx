import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import getText from "../../../utils/getText";

function MaxConnections(api_status) {
  const [isLoading, data] = api_status.response;

  let value = !isLoading ? data.dependencies.database.max_connections : false;
  let text = getText(isLoading, value);

  return <StatusDataBaseMarginLeft descricao="Max Connetions" value={text} />;
}

export default MaxConnections;
