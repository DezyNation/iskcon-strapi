"use strict";

/**
 * volunteer controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::volunteer.volunteer",
  ({ strapi }) => ({
    fetchVolunteers: async (ctx, next) => {
      try {
        const { name } = ctx.request.body;
        const result = await strapi.entityService.findMany(
          "api::volunteer.volunteer",
          {
            fields: ["name", "createdAt", "canVote"],
          }
        );
        ctx.body = result;
      } catch (error) {
        ctx.body = error;
      }
    },
  })
);
