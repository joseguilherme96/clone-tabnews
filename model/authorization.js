import { InternalServerError } from "infra/errors";

const availableFeatures = [
  //user
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:others",

  //session
  "read:session",
  "create:session",

  //activation
  "read:activation_token",

  //migration
  "read:migration",
  "create:migration",

  //status
  "read:status",
  "read:status:all",
];

function can(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);

  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, resource) {
  validateUser(user);
  validateFeature(feature);
  validateResource(resource);

  if (feature === "read:user") {
    return {
      id: resource.id,
      username: resource.username,
      features: resource.features,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === "read:session") {
    if (user.id === resource.user_id) {
      return {
        id: resource.id,
        user_id: resource.user_id,
        token: resource.token,
        expires_at: resource.expires_at,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: resource.id,
      user_id: resource.user_id,
      used_at: resource.used_at,
      created_at: resource.created_at,
      expires_at: resource.expires_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === "read:migration") {
    return resource.map((migration) => ({
      path: migration.path,
      name: migration.name,
      timestamp: migration.timestamp,
    }));
  }

  if (feature === "create:migration") {
    return resource.map((migration) => ({
      path: migration.path,
      name: migration.name,
      timestamp: migration.timestamp,
    }));
  }

  if (feature === "read:status") {
    let output = {
      updated_at: resource.updated_at,
      dependencies: {
        database: {
          max_connections: resource.dependencies.database.max_connections,
          opened_connetions: resource.dependencies.database.opened_connetions,
        },
      },
    };

    if (can(user, "read:status:all", resource)) {
      output.dependencies.database.version =
        resource.dependencies.database.version;
    }

    return output;
  }
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "A função .can() precisa que seja passado como argumento o user.",
    });
  }
}

function validateFeature(feature) {
  if (!feature || !availableFeatures.includes(feature)) {
    throw new InternalServerError({
      cause:
        "È necessário fornecer uma `feaure` conhecida no model `authorization`.",
    });
  }
}

function validateResource(resource) {
  if (!resource) {
    throw new InternalServerError({
      cause:
        "È necessário fornecer uma `resource` conhecido no model `authorization`.",
    });
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
