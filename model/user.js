import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors.js";

async function create(inputCreateUser) {
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

async function findOneByUsername(username) {
  const result = await runSelectQuery(username);
  const userFound = userOrThrowNewNotFoundError(result);

  return userFound;

  async function runSelectQuery(username) {
    const result = await database.query({
      text: `
        SELECT

          *
        FROM
          users
        WHERE
          LOWER(username) = LOWER($1)
        LIMIT
          1
        ;`,
      values: [username],
    });

    return result;
  }

  function userOrThrowNewNotFoundError(result) {
    if (result.rowCount == 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
      });
    }

    return result.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
};

export default user;
