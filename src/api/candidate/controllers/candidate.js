"use strict";

/**
 * candidate controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::candidate.candidate",
  ({ strapi }) => ({
    getAllCandidates: async (ctx, next) => {
      try {
        const result = await strapi.entityService.findMany(
          "api::candidate.candidate",
          {
            fields: ["id", "post"],
            populate: {
              volunteer: {
                fields: ["id", "idNumber", "name", "email", "avatar"],
              },
            },
          }
        );
        ctx.body = result;
      } catch (error) {
        ctx.body = error;
      }
    },
  })
);
