import orchestrator from "tests/orchestrator"

beforeAll(async () =>{
  await orchestrator.waitForAllServices()
})


test("Connections to the database opened for migrations, but using prohibited methods, should be closed.", async ()=>{


const responseStatus = await fetch("http://localhost:3000/api/v1/status")
const responseStatusBody = await responseStatus.json()

expect(responseStatusBody.dependencies.database.opened_connetions).toBe(1)

})