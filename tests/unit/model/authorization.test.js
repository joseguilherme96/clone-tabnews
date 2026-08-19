import { InternalServerError } from "infra/errors";
import authorization from "model/authorization.js";

describe("model/authorization.js", () => {
  describe(".can()", () => {
    test("Without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("Without `feature`", () => {
      const user = {
        features: ["read:activation_token"],
      };

      expect(() => {
        authorization.can(user);
      }).toThrow(InternalServerError);
    });

    test("With `feature` unknown", () => {
      const user = {
        features: ["read:activation_token"],
      };

      expect(() => {
        authorization.can(user, "unknown");
      }).toThrow(InternalServerError);
    });

    test("Without `user.features`", () => {
      const user = {};

      expect(() => {
        authorization.can(user, "unknown");
      }).toThrow(InternalServerError);
    });

    test("With valid `user` and known `feature`", () => {
      const user = {
        features: ["read:activation_token"],
      };

      const resource = {
        user_id: "a8db-fg63-jf8c-dh7",
      };

      expect(authorization.can(user, "read:activation_token", resource)).toBe(
        true,
      );
    });

    test("With valid `user`, known `feature` and `resource``", () => {
      const user = {
        id: "a8db-fg63-jf8c-dh7",
        features: ["update:user"],
      };

      const resource = {
        id: "a8db-fg63-jf8c-dh7",
      };

      expect(authorization.can(user, "update:user", resource)).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("Without `user`", () => {
      expect(() => {
        authorization.filterOutput();
      }).toThrow(InternalServerError);
    });

    test("Without `feature`", () => {
      const user = {
        features: ["read:activation_token"],
      };

      expect(() => {
        authorization.filterOutput(user);
      }).toThrow(InternalServerError);
    });

    test("With unknown `feature`", () => {
      const user = {
        features: ["read:activation_token"],
      };

      expect(() => {
        authorization.filterOutput(user, "unknown");
      }).toThrow(InternalServerError);
    });

    test("Without `user.features`", () => {
      const user = {};

      expect(() => {
        authorization.filterOutput(user, "unknown");
      }).toThrow(InternalServerError);
    });

    test("With valid `user` and known `feature` and `resource`", () => {
      const createdUser = {
        id: "jdh8-shdd8-js7s-dd8s-df87-sdd",
        username: "known",
        email: "known@known.com.br",
        password: "djddjjdjd",
        features: ["read:user"],
      };

      const resource = {
        id: "jdh8-shdd8-js7s-dd8s-df87-sdd",
        username: "known",
        email: "known@known.com.br",
        password: "djddjjdjd",
        features: ["read:user"],
        created_at: "2026-08-19T00:00:00",
        updated_at: "2026-08-19T00:00:00",
      };

      const result = authorization.filterOutput(
        createdUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: "jdh8-shdd8-js7s-dd8s-df87-sdd",
        username: "known",
        features: ["read:user"],
        created_at: "2026-08-19T00:00:00",
        updated_at: "2026-08-19T00:00:00",
      });
    });

    test("With valid `user`, known `feature` but no `resource`", () => {
      const user = {
        id: "a8db-fg63-jf8c-dh7",
        features: ["read:activation_token"],
      };

      expect(() => {
        authorization.filterOutput(user, "read:activation_token");
      }).toThrow(InternalServerError);
    });

    test("With valid `user`, known `feature` and `resource`", () => {
      const user = {
        id: "a8db-fg63-jf8c-dh7",
        features: ["update:user"],
      };

      const resource = {
        id: "jdh8-shdd8-js7s-dd8s-df87-sdd",
        username: "known",
        email: "known@known.com.br",
        password: "djddjjdjd",
        features: ["read:user"],
        created_at: "2026-08-19T00:00:00",
        updated_at: "2026-08-19T00:00:00",
      };

      expect(authorization.filterOutput(user, "read:user", resource)).toEqual({
        id: "jdh8-shdd8-js7s-dd8s-df87-sdd",
        username: "known",
        features: ["read:user"],
        created_at: "2026-08-19T00:00:00",
        updated_at: "2026-08-19T00:00:00",
      });
    });
  });
});
