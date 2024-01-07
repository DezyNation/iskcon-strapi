"use strict";

/**
 * content-control controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::content-control.content-control",
  ({ strapi }) => ({
    updateData: async (ctx) => {
      try {
        const { pin } = ctx.request.body;
        console.log(ctx.request.body)
        const existingData = await strapi.entityService.findMany(
          "api::content-control.content-control",
          {
            fields: ["pin"],
          }
        );

        console.log(existingData)

        if (Number(existingData?.pin) == Number(pin)) {
            try {
                await strapi.entityService.update(
                  "api::content-control.content-control",
                  existingData.id,
                  {
                    data: { ...ctx.request.body },
                  }
                );
                return ctx.body = {message: "OK"};
            } catch (error) {
                console.log(error)
            }

        } else {
          ctx.badRequest = "PIN did not match";
        }
      } catch (error) {
        ctx.internalServerError = error;
      }
    },
  })
);
