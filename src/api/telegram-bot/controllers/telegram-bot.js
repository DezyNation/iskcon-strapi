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
        const data = await strapi.entityService.findMany(
          "api::telegram-bot.telegram-bot",
          {
            fields: ["id", "chats"],
          }
        );
        console.log("TG BOT DATA");
        console.log(data);
        try {
          await strapi
            .service("api::telegram-bot.telegram-bot")
            .triggerService({
              method: "post",
              endpoint: "sendMessage",
              body: {
                chat_id: data?.chats?.notificationsGroupChatId,
                text: JSON.stringify(ctx.request.body),
              },
            });
          ctx.body = true;
        } catch (error) {
          await strapi
            .service("api::telegram-bot.telegram-bot")
            .triggerService({
              method: "post",
              endpoint: "sendMessage",
              body: {
                chat_id: data?.chats?.errorGroupChatId,
                text:
                  "There was an error in the controller, chat ID was " +
                  data?.chats?.notificationsGroupChatId +
                  " and the error was " +
                  JSON.stringify(error),
              },
            });
          ctx.body = true;
        }
      } catch (error) {
        console.log("Internal Server Error");
        ctx.internalServerError = error;
      }
    },
  })
);
