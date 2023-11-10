const { default: axios } = require("axios");

module.exports = (plugin) => {
  plugin.controllers.user.deleteRequest = async (ctx) => {
    try {
      const { email, secretPin, reason } = ctx.request.body;

      const result = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["id"],
          filters: {
            $and: [
              {
                email: email,
              },
              {
                secretPin: secretPin,
              },
            ],
          },
        }
      );
      if (!result?.length) {
        ctx.status = 400;
        ctx.body = { message: "User not found!" };
        return;
      }
      const userId = result[0]?.id;
      
      const pendingRequests = await strapi.entityService.findMany(
        "api::account-delete-request.account-delete-request",
        {
          filters: {
            $and: [
              {
                user: userId,
              },
              {
                status: {
                  $in: ["Pending", "In Progress"],
                },
              },
            ],
          },
        }
      );
      if (pendingRequests?.length) {
        ctx.status = 429;
        ctx.body = { message: "We are already processing your request!" };
        return;
      }
      const newRequest = await strapi.entityService.create(
        "api::account-delete-request.account-delete-request",
        {
          data: {
            status: "Pending",
            reason: reason,
            user: {
              connect: [userId],
            },
          },
        }
      );

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        userId,
        {
          data: {
            blocked: true
          },
        }
      );

      ctx.body = { message: "Request raised", response: newRequest };
    } catch (error) {
      ctx.body = error;
    }
  };

  plugin.routes["content-api"].routes.push(
    {
      method: "POST",
      path: "/users/account/request-delete",
      handler: "user.deleteRequest",
      config: {
        prefix: "",
      },
    }
  );

  return plugin;
};
