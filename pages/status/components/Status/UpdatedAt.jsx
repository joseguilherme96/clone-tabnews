import useSWRFecthAPIStatus from "../../services/useSWRFecthAPIStatus";
import Status from "./share/Status";
import getText from "../../utils/getText";

function UpdatedAt() {
  const { isLoading, data } = useSWRFecthAPIStatus();

  let value = !isLoading
    ? new Date(data.updated_at).toLocaleString("pt-BR")
    : false;
  let text = getText(isLoading, value);

  return <Status descricao="Ultima atualização" value={text} />;
}

export default UpdatedAt;
