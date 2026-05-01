import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import getText from "../../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";

function OpenedConnetions() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading ? data.dependencies.database.opened_connetions : false;
  let text = getText(isLoading, value);

  return (
    <StatusDataBaseMarginLeft
      descricao="Opened Connetions"
      value={text}
    ></StatusDataBaseMarginLeft>
  );
}

export default OpenedConnetions;
