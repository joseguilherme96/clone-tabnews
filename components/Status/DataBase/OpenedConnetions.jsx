import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import getText from "../../../pages/status/utils/getText";

function OpenedConnetions(api_status) {
  const [isLoading, data] = api_status.response;

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
