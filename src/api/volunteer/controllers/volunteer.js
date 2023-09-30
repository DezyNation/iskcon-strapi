"use strict";

/**
 * volunteer controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::volunteer.volunteer",
  ({ strapi }) => ({
    createNewVolunteer: async (ctx, next) => {
      try {
        const { name } = ctx.request.body;
        const result = await strapi.entityService.create(
          "api::volunteer.volunteer",
          {
            fields: ["name", "createdAt"],
            data: {
              name: name,
              idNumber:
                Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000,
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
