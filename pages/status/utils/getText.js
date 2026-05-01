function getText(isLoading, value) {
  let text = "Carregando.....";

  if (!isLoading) {
    text = value;
  }

  return text;
}

export default getText;
