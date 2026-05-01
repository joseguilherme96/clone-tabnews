import ColorTextDefault from "../../components/Color/ColorTextDefault";
import UpdatedAt from "../../components/Status/UpdatedAt";
import DataBase from "../../components/Status/DataBase/DataBase";

export default function StatusPage() {
  return (
    <>
      <h1>
        <ColorTextDefault descricao="Status" />
      </h1>
      <UpdatedAt />
      <DataBase />
    </>
  );
}
