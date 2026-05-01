import StatusDataBaseMarginLeft from "./share/StatusDatabase";
import getText from "../../../utils/getText";

function Version(api_status) {
  const [isLoading, data] = api_status.response;

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
