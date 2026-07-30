import email from "infra/email.js";
import database from "infra/database";
import webserver from "infra/webserver";
import { NotFoundError } from "infra/errors";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000; // Expires in 15 minutes

export async function create(newUser) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);
  const newToken = await runInsertQuery(newUser.id, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
            
                INSERT INTO 
                
                    user_activation_tokens(user_id,expires_at)

                VALUES

                    ($1,$2)

                RETURNING

                    *
            
            ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

export async function findOneByUserId(userId) {
  const token = await runSelectQuery(userId);
  return token;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
                SELECT
                    *
                FROM
                    user_activation_tokens

                WHERE

                    user_id = $1
            `,
      values: [userId],
    });

    return results.rows[0];
  }
}

export async function findOneValidByToken(token) {
  const validToken = await runSelectQuery(token);
  return validToken;

  async function runSelectQuery(token) {
    const results = await database.query({
      text: `
      
        SELECT

          *

        FROM

          user_activation_tokens

        WHERE

          id = $1 AND 
          used_at is Null AND
          expires_at > NOW()

        LIMIT

          1;

      `,
      values: [token],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({
        message:
          "O token de ativação utilizado não foi encontrado no sistema ou expirou.",
        action: "Faça um novo cadastro.",
      });
    }

    return results.rows[0];
  }
}

export async function sendEmailToUser(user, activationToken) {
  await email.send({
    from: "ModernSystems <contato@modernsystems.com>",
    to: `${user.email}`,
    subject: "Ative o seu cadastro",
    text: `${user.username},

Segue link de ativação abaixo:
${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,
Equipe ModernSystems
`,
  });
}

const activation = {
  sendEmailToUser,
  findOneByUserId,
  create,
  findOneValidByToken,
};

export default activation;
