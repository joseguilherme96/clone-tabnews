import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import getText from "../../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";

function Version() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading ? data.dependencies.database.version : false;
  let text = getText(isLoading, value);

  return (
    <StatusDataBaseMarginLeft
      descricao="Version"
      value={text}
    ></StatusDataBaseMarginLeft>
  );
}

export default Version;
