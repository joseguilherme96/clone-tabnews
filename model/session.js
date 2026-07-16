import crypto from "node:crypto";
import database from "infra/database.js";
import {UnauthorizedError} from 'infra/errors.js'

const EXPIRE_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000; // Expire in 30 days

async function create(userId) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRE_IN_MILISECONDS);
  console.log(expiresAt)

  const results = await database.query({
    text: `

            INSERT INTO 

                session (user_id, token, expires_at) 
            
            VALUES
                ($1,$2,$3)

            RETURNING

            * ;
        
        `,
    values: [userId, token, expiresAt],
  });

  return results.rows[0];
}

async function findOneValidByToken(sessionToken){

  const results = await database.query({
    text: `

      SELECT

        id,
        user_id,
        token,
        expires_at,
        created_at,
        updated_at

      FROM

        session

      WHERE 

        token = $1
        AND expires_at > NOW()

      LIMIT 1;
    
    `,
    values: [sessionToken]
  })

  if(results.rowCount == 0){

    throw new UnauthorizedError({
      message: "Usuário não possui sessão ativa.",
      action: "Verifique se o usuário está logado e tente novamente."
    })

  }
  return results.rows[0]

}

async function renew(sessionId) {

  const expiresAt = new Date(Date.now() + EXPIRE_IN_MILISECONDS);
  
  const results = await database.query({
    text: `

      UPDATE

        session

      SET

        expires_at = $2,
        updated_at = NOW()

      WHERE 

        id = $1

      RETURNING

        *

      ;

    `,
    values:[sessionId,expiresAt]
  })

  return results.rows[0]
  
}

const session = {
  create,
  EXPIRE_IN_MILISECONDS,
  findOneValidByToken,
  renew
};

export default session;
