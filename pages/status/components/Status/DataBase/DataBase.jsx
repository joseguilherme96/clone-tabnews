import Version from "./Version";
import MaxConnections from "./MaxConnections";
import OpenedConnetions from "./OpenedConnetions";
import ColorTextDefault from "../../Color/ColorTextDefault";

function DataBase() {
  return (
    <>
      <ColorTextDefault descricao="Data Base" />
      <Version />
      <MaxConnections />
      <OpenedConnetions />
    </>
  );
}

export default DataBase;
