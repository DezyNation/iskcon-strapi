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
            blocked: true,
          },
        }
      );

      ctx.body = { message: "Request raised", response: newRequest };
    } catch (error) {
      ctx.body = error;
    }
  };

  plugin.controllers.user.updateMe = async (ctx) => {
    try {
      const { id } = ctx.state.user;

      const userExist = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        id,
        {
          fields: ["id"],
        }
      );

      if (!userExist?.id) {
        ctx.unauthorized = { message: "User not found!" };
        return;
      }

      const dataToUpdate = ctx.request.body;

      if (
        dataToUpdate?.hasOwnProperty("provider") ||
        dataToUpdate?.hasOwnProperty("resetPasswordToken") ||
        dataToUpdate?.hasOwnProperty("confirmationToken") ||
        dataToUpdate?.hasOwnProperty("confirmed") ||
        dataToUpdate?.hasOwnProperty("blocked") ||
        dataToUpdate?.hasOwnProperty("isCoordinator") ||
        dataToUpdate?.hasOwnProperty("role")
      ) {
        ctx.badRequest = { message: "Can't update sensitive fields!" };
        return;
      }

      await strapi.entityService.update(
        "plugin::users-permissions.user",
        parseInt(id),
        {
          data: {
            ...dataToUpdate,
          },
        }
      );

      ctx.body = { message: "OK" };
    } catch (error) {
      console.log("Updating User Error");
      console.log(error);
      ctx.internalServerError(error);
    }
  };

  plugin.controllers.user.team = async (ctx) => {
    try {
      const res = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: ["id", "name", "spiritualName", "qualification"],
          filters: { isCoordinator: true },
          populate: {
            avatar: {
              fields: ["url"],
            },
          },
          sort: {
            teamPriority: "asc",
          },
        }
      );

      ctx.body = res;
    } catch (error) {
      ctx.internalServerError(error);
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
    },
    {
      method: "PUT",
      path: "/users/update/me",
      handler: "user.updateMe",
      config: {
        prefix: "",
      },
    },
    {
      method: "GET",
      path: "/team",
      handler: "user.team",
      config: {
        prefix: "",
      },
    }
  );

  return plugin;
};
