import Status from "../../share/Status";

function StatusDataBaseMarginLeft(text) {
  return (
    <>
      <div style={{ marginLeft: 10 }}>
        <Status descricao={text.descricao} value={text.value} />
      </div>
    </>
  );
}

export default StatusDataBaseMarginLeft;
