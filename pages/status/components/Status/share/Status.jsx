import ColorTextDefault from "../../Color/ColorTextDefault";

function Status(text) {
  return (
    <>
      <div style={{ display: "flex" }}>
        <ColorTextDefault descricao={text.descricao} /> :{" "}
        <div>{text.value}</div>
      </div>
    </>
  );
}

export default Status;
