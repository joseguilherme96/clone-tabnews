import Version from "./Version";
import MaxConnections from "./MaxConnections";
import OpenedConnetions from "./OpenedConnetions";
import ColorTextDefault from "../../Color/ColorTextDefault";

function DataBase(api_status) {
  return (
    <>
      <ColorTextDefault descricao="Data Base" />
      <Version response={api_status.response} />
      <MaxConnections response={api_status.response} />
      <OpenedConnetions response={api_status.response} />
    </>
  );
}

export default DataBase;
