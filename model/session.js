import crypto from "node:crypto";
import database from "infra/database.js";
import { UnauthorizedError } from "infra/errors.js";

const EXPIRE_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000; // Expire in 30 days

async function create(user) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRE_IN_MILISECONDS);

  const results = await database.query({
    text: `

            INSERT INTO 

                session (user_id, token, expires_at) 
            
            VALUES
                ($1,$2,$3)

            RETURNING

            * ;
        
        `,
    values: [user.id, token, expiresAt],
  });

  return results.rows[0];
}

async function findOneValidByToken(sessionToken) {
  const now = new Date(Date.now());

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
        AND expires_at > $2

      LIMIT 1;
    
    `,
    values: [sessionToken, now],
  });

  if (results.rowCount == 0) {
    throw new UnauthorizedError({
      message: "Usuário não possui sessão ativa.",
      action: "Verifique se o usuário está logado e tente novamente.",
    });
  }

  return results.rows[0];
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRE_IN_MILISECONDS);

  const results = await database.query({
    text: `

      UPDATE

        session

      SET

        expires_at = $2,
        updated_at = timezone('utc',now())

      WHERE 

        id = $1

      RETURNING

        *

      ;

    `,
    values: [sessionId, expiresAt],
  });

  return results.rows[0];
}

async function expireById(sessionId) {
  const results = await database.query({
    text: `

      UPDATE

        session

      SET

        expires_at = expires_at  - interval '1 year',
        updated_at = timezone('utc',now())

      WHERE 

        id = $1

      RETURNING

        *

      ;

    `,
    values: [sessionId],
  });

  return results.rows[0];
}

const session = {
  create,
  EXPIRE_IN_MILISECONDS,
  findOneValidByToken,
  renew,
  expireById,
};

export default session;
