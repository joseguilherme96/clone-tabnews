function status(request, response) {
  response.status(200).json({ message: "Status API" });
}
export default status;
