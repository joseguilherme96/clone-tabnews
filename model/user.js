import database from "infra/database";
import { ValidationError } from "infra/errors.js";

export default async function create(inputCreateUser) {
  await validateUniqueUsername(inputCreateUser.username);
  await validateUniqueEmail(inputCreateUser.email);
  const newUser = await runInsertQuery(inputCreateUser);

  return newUser;

  async function validateUniqueUsername(username) {
    const results = await database.query({
      text: `

            SELECT
                *
            FROM

                users
            
            WHERE

                LOWER(username) = LOWER($1)
        
        ;`,

      values: [username],
    });
    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar está operação.",
      });
    }
  }

  async function validateUniqueEmail(email) {
    const results = await database.query({
      text: `

            SELECT
                *
            FROM

                users
            
            WHERE

                LOWER(email) = LOWER($1)
        
        ;`,

      values: [email],
    });

    if (results.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar está operação.",
      });
    }
  }

  async function runInsertQuery(inputCreateUser) {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password)
            VALUES
          ($1, $2, $3)
            RETURNING

            *

            ;
        
        `,
      values: [
        inputCreateUser.username,
        inputCreateUser.email,
        inputCreateUser.password,
      ],
    });

    return results.rows[0];
  }
}
