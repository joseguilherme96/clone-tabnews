import Status from "./share/Status";
import getText from "../../pages/status/utils/getText";

function UpdatedAt(api_status) {
  const [isLoading, data] = api_status.response;

  let value = !isLoading
    ? new Date(data.updated_at).toLocaleString("pt-BR")
    : false;
  let text = getText(isLoading, value);

  return <Status descricao="Ultima atualização" value={text} />;
}

export default UpdatedAt;
