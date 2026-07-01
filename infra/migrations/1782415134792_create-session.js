exports.up = (pgm) => {
  pgm.createTable("session", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },

    user_id: {
      type: "uuid",
      notNull: true,
    },

    token: {
      type: "varchar(96)",
      notNull: true,
      unique: true,
    },

    expires_at: {
      type: "timestamptz",
      notNull: true,
    },

    // Why timestamp with timezone? https://justatheory.com/2012/04/postgres-use-timestamptz/
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc',now())"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("timezone('utc',now())"),
    },
  });
};

exports.down = false;
