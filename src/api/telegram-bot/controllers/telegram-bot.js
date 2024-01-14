"use strict";

/**
 * telegram-bot controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::telegram-bot.telegram-bot",
  ({ strapi }) => ({
    webhookResponse: async (ctx) => {
      try {
        console.log("Telegram Header");
        console.log(ctx.request.headers["X-Telegram-Bot-Api-Secret-Token"]);
        const data = await strapi.entityService.findMany(
          "api::telegram-bot.telegram-bot",
          {
            fields: ["id", "chats"],
          }
        );
        console.log(data);
        try {
          await strapi
            .service("api::telegram-bot.telegram-bot")
            .triggerService({
              method: "post",
              endpoint: "sendMessage",
              body: {
                channelId: data?.chats?.notificationsGroupChatId,
                text: JSON.stringify(ctx.request.body),
              },
            });
          ctx.body = true;
        } catch (error) {
          //   await strapi
          //     .service("api::telegram-bot.telegram-bot")
          //     .triggerService({
          //       method: "post",
          //       endpoint: "sendMessage",
          //       body: {
          //         channelId: "-4166267476",
          //         text:
          //           "There was an error in the controller, chat ID was " +
          //           data?.chats?.notificationsGroupChatId +
          //           " and the error was " +
          //           JSON.stringify(error),
          //       },
          //     });
          console.log("Error processing webhook");
          console.log(ctx.request.body);
          console.log("Error was here ---------------");
          console.log(error);
          ctx.body = true;
        }
      } catch (error) {
        console.log("Internal Server Error");
        ctx.internalServerError = error;
      }
    },
  })
);
