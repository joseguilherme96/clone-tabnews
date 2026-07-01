import crypto from "node:crypto";
import database from "infra/database.js";

const EXPIRE_IN_MILISECONDS = 60 * 60 * 24 * 30 * 1000; // Expire in 30 days

async function create(userId) {
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
    values: [userId, token, expiresAt],
  });

  return results.rows[0];
}

const session = {
  create,
  EXPIRE_IN_MILISECONDS,
};

export default session;
