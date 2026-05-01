import ColorTextDefault from "../../components/Color/ColorTextDefault";
import UpdatedAt from "../../components/Status/UpdatedAt";
import DataBase from "../../components/Status/DataBase/DataBase";
import useSWRFecthAPIStatus from "./services/useSWRFecthAPIStatus";

export default function StatusPage() {
  const { isLoading, data } = useSWRFecthAPIStatus();
  return (
    <>
      <h1>
        <ColorTextDefault descricao="Status" />
      </h1>
      <UpdatedAt response={[isLoading, data]} />
      <DataBase response={[isLoading, data]} />
    </>
  );
}
