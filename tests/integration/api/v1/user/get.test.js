import session from "model/session";
import orchestrator from "tests/orchestrator.js"
import {version as uuidVersion} from 'uuid'
import SetCookieParser from 'set-cookie-parser'

beforeAll(async ()=>{
    await orchestrator.waitForAllServices();
    await orchestrator.cleanDataBase();
    await orchestrator.runPendingMigrations()
})

describe('GET /api/v1/user', ()=> {

    describe('Default User', ()=> {

        test('With valid Session', async()=>{

            const createdUser = await orchestrator.createUser({
                username: "UserWithSessionValid"
            })

            const createSession = await orchestrator.createSession(createdUser.id)
            const response = await fetch('http://localhost:3000/api/v1/user',{
                headers:{
                    Cookie: `session_id=${createSession.token}`
                }
            })

            expect(response.status).toBe(200)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                id : createdUser.id,
                username: "UserWithSessionValid",
                email: createdUser.email,
                password: createdUser.password,
                created_at : createdUser.created_at.toISOString(),
                updated_at : createdUser.updated_at.toISOString(),
            })

            expect(uuidVersion(responseBody.id)).toBe(4)
            expect(new Date(responseBody.created_at)).not.toBeNaN()
            expect(new Date(responseBody.updated_at)).not.toBeNaN()


            const renowedSession = await session.findOneValidByToken(createSession.token)
            
            expect(renowedSession.expires_at > createSession.expires_at).toBe(true)
            expect(renowedSession.updated_at > createSession.updated_at).toBe(true)
            
            const parsedSetCookie = SetCookieParser.parse(response,{
                map: true
            })
            expect(parsedSetCookie.session_id.value).toBe(renowedSession.token)

        })

        test('With noexistent Session', async()=>{

            const noexistent = "8b8e00de04454f5d0728bdcb731daf49e99d9620019d322cccc8080283b945f0bb86542cd6dc36ecacc9bca4c1d55bb4"

            const response = await fetch('http://localhost:3000/api/v1/user',{
                headers:{
                    Cookie: `session_id=${noexistent}`
                }
            })

            expect(response.status).toBe(401)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Usuário não possui sessão ativa.",
                action: "Verifique se o usuário está logado e tente novamente.",
                status_code: 401,
            })

        })

        test('With invalid Session', async()=>{

            jest.useFakeTimers({
                now: new Date() - session.EXPIRE_IN_MILISECONDS
            })
            const createdUser = await orchestrator.createUser({
                username: "UserWithInvalidSession"
            })

            const createSession = await orchestrator.createSession(createdUser.id)
            
            jest.useRealTimers();

            const response = await fetch('http://localhost:3000/api/v1/user',{
                headers:{
                    Cookie: `session_id=${createSession.token}`
                }
            })

            expect(response.status).toBe(401)

            const responseBody = await response.json()

            expect(responseBody).toEqual({
                name: "UnauthorizedError",
                message: "Usuário não possui sessão ativa.",
                action: "Verifique se o usuário está logado e tente novamente.",
                status_code: 401,
            })

        })

        test('With the session expiring soon', async()=>{

            jest.useFakeTimers({
                now: new Date(Date.now() - 100000)
            })
            const createdUser = await orchestrator.createUser({
                username: "SessionExpiringSoon"
            })

            const createSession = await orchestrator.createSession(createdUser.id)
            
            jest.useRealTimers();

            const response = await fetch('http://localhost:3000/api/v1/user',{
                headers:{
                    Cookie: `session_id=${createSession.token}`
                }
            })

            expect(response.status).toBe(200)

        })

    })


})