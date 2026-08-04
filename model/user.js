import database from "infra/database";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors.js";
import password from "model/password";

async function create(inputCreateUser) {
  await validateUniqueUsername(inputCreateUser.username);
  await validateUniqueEmail(inputCreateUser.email);
  await hashPasswordInObject(inputCreateUser);

  await injectDefaultFeaturesInObject(inputCreateUser);

  const newUser = await runInsertQuery(inputCreateUser);
  return newUser;

  async function runInsertQuery(inputCreateUser) {
    const results = await database.query({
      text: `
        INSERT INTO
          users (username, email, password, features)
            VALUES
          ($1, $2, $3, $4)
            RETURNING

            *

            ;
        
        `,
      values: [
        inputCreateUser.username,
        inputCreateUser.email,
        inputCreateUser.password,
        inputCreateUser.features,
      ],
    });

    return results.rows[0];
  }

  async function injectDefaultFeaturesInObject(inputCreateUser) {
    inputCreateUser.features = ["read:activation_token", "read:session"];
  }
}

async function update(username, userInputValues) {
  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const currentUser = await findOneByUsername(username);
  const userWithNewValues = { ...currentUser, ...userInputValues };
  const updatedUser = await runUpdateQuery(userWithNewValues);
  return updatedUser;

  async function runUpdateQuery(userWithNewValues) {
    const results = await database.query({
      text: `

        UPDATE 
          users 
        SET 
          username = $2,
          email = $3,
          password = $4,
          updated_at = timezone('utc',now())
        WHERE 
          id = $1
        RETURNING
          *
      `,
      values: [
        userWithNewValues.id,
        userWithNewValues.username,
        userWithNewValues.email,
        userWithNewValues.password,
      ],
    });

    return results.rows[0];
  }
}

async function hashPasswordInObject(inputCreateUser) {
  const hashedPassword = await password.hash(inputCreateUser.password);
  inputCreateUser.password = hashedPassword;
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

async function findOneByEmail(email) {
  const result = await runSelectQuery(email);
  const userFound = userOrThrowNewNotFoundError(result);

  return userFound;

  async function runSelectQuery(email) {
    const results = await database.query({
      text: `
        SELECT

          *

        FROM

          users

        WHERE

          LOWER(email) = LOWER($1)

        LIMIT
          1
        ;`,
      values: [email],
    });

    return results;
  }

  function userOrThrowNewNotFoundError(results) {
    if (result.rowCount == 0) {
      throw new UnauthorizedError({
        message: "O email informado não foi encontrado no sistema.",
        action: "Verifique se o email está digitado corretamente.",
      });
    }

    return results.rows[0];
  }
}

async function findOneById(userId) {
  const result = await runSelectQuery(userId);
  const userFound = userOrThrowNewNotFoundError(result);

  return userFound;

  async function runSelectQuery(userId) {
    const result = await database.query({
      text: `
        SELECT

          *

        FROM
          users
        WHERE
          id = $1
        LIMIT
          1
        ;`,
      values: [userId],
    });

    return result;
  }

  function userOrThrowNewNotFoundError(result) {
    if (result.rowCount == 0) {
      throw new NotFoundError({
        message: "O id informado não foi encontrado no sistema.",
        action: "Verifique se o id está digitado corretamente.",
      });
    }

    return result.rows[0];
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

async function setFeatures(userId, feature) {
  const newFeature = await runUpdateQuery(userId, feature);

  return newFeature;

  async function runUpdateQuery(userId, feature) {
    const results = await database.query({
      text: `
        UPDATE
          users
        SET
          features = $2,
          updated_at = timezone('utc', now())

        WHERE 

          id = $1

        RETURNING

          *
      ;`,
      values: [userId, feature],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  findOneByEmail,
  findOneById,
  update,
  setFeatures,
};

export default user;
