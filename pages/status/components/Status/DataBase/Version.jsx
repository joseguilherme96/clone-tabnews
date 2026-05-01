import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import useSWRFecthAPIStatus from "../../../services/useSWRFecthAPIStatus";
import getText from "../../../utils/getText";

function Version() {
  const { isLoading, data } = useSWRFecthAPIStatus();

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
