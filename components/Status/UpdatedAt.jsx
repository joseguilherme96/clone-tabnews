import Status from "./share/Status";
import getText from "../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";

function UpdatedAt() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading
    ? new Date(data.updated_at).toLocaleString("pt-BR")
    : false;
  let text = getText(isLoading, value);

  return <Status descricao="Ultima atualização" value={text} />;
}

export default UpdatedAt;
