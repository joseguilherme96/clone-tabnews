function Color(text) {
  return (
    <>
      <div style={{ color: text.color }}>{text.text}</div>
    </>
  );
}

export default Color;
