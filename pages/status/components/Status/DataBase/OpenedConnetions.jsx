import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import useSWRFecthAPIStatus from "../../../services/useSWRFecthAPIStatus";
import getText from "../../../utils/getText";

function OpenedConnetions() {
  const { isLoading, data } = useSWRFecthAPIStatus();

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
