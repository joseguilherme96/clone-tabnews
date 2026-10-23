import getText from "../../pages/status/utils/getText";
import useSWRFecthAPIStatus from "pages/status/services/useSWRFecthAPIStatus";
import { Banner } from "@primer/react";

function UpdatedAt() {
  const [isLoading, data] = useSWRFecthAPIStatus();

  let value = !isLoading
    ? new Date(data.updated_at).toLocaleString("pt-BR")
    : false;
  let date_time = getText(isLoading, value);

  return (
    <Banner layout="compact">
      <Banner.Title>Ultima atualização {date_time}</Banner.Title>
    </Banner>
  );
}

export default UpdatedAt;
