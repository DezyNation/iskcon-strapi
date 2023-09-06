"use strict";

/**
 * temple controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::temple.temple", ({ strapi }) => ({
  getUsers: async (ctx, next) => {
    try {
      const { role } = ctx.params;
      
      const result = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["name", "username"],
          filters: {
            role: {
              name: "Preacher",
            },
          },
          populate: {
            avatar: {
              fields: ["url"],
            },
          },
        }
      );
      ctx.body = result
    } catch (error) {
      console.log(error);
      ctx.body = error;
    }
  },
}));
