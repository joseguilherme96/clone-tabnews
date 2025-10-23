import database from '../../../../infra/database.js'

async function status(request, response) {

  const result = await database.query("SELECT 5 + 1");
  console.log(result.rows);
  response.status(200).json({ message: "Status API" });
}
export default status;
