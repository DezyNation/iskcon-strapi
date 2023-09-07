const { default: axios } = require("axios");

module.exports = (plugin) => {
  plugin.controllers.user.getRcToken = async (ctx) => {
    try {
      const { id } = ctx.state.user;

      const result = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        id,
        {
          fields: ["id", "rcToken"],
        }
      );
      ctx.body = { token: result?.rcToken };
    } catch (error) {
      ctx.body = error;
    }
  };

  plugin.controllers.user.rcRegister = async (ctx) => {
    try {
      const { id } = ctx.state.user;
      const { password } = ctx.request.body;
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        id,
        {
          fields: ["id", "name", "username", "email"],
        }
      );
      const result = await axios.post(
        `${process.env.CHAT_BASE_URL}/api/v1/users.create`,
        {
          username: user?.username,
          email: user?.email,
          password: password,
          name: user?.name || `User ${user?.id}`,
        },
        {
          headers: {
            "X-Auth-Token": process.env.RC_AUTH_TOKEN,
            "X-User-Id": process.env.RC_USER_ID,
          },
        }
      );
      console.log("RC register log");
      console.log(result);
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  };

  plugin.controllers.user.rcLogin = async (ctx) => {
    try {
      const { id } = ctx.state.user;
      const { password } = ctx.request.body;
      const user = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        id,
        {
          fields: ["id", "name", "username", "email"],
        }
      );
      const result = await axios
        .post(
          `${process.env.CHAT_BASE_URL}/api/v1/login`,
          {
            username: user?.username,
            password: password,
          },
          {
            headers: {
              "X-Auth-Token": process.env.RC_AUTH_TOKEN,
              "X-User-Id": process.env.RC_USER_ID,
            },
          }
        )
        .then(async (res) => {
          await strapi.entityService.update(
            "plugin::users-permissions.user",
            id,
            {
              data: {
                rcToken: res.data?.data?.authToken,
              },
            }
          );
        });
      console.log("RC login log");
      console.log(result);
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  };

  plugin.routes["content-api"].routes.push(
    {
      method: "GET",
      path: "/rc/token",
      handler: "user.getRcToken",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/rc/register",
      handler: "user.rcRegister",
      config: {
        prefix: "",
      },
    },
    {
      method: "POST",
      path: "/rc/login",
      handler: "user.rcLogin",
      config: {
        prefix: "",
      },
    }
  );

  return plugin;
};
