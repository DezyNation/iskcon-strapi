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
        return true
        // const data = await strapi.entityService.findMany(
        //   "api::telegram-bot.telegram-bot",
        //   {
        //     fields: ["id", "chats"],
        //   }
        // );

        // try {
        //   const existingChat = data?.pastGroups?.filter(
        //     (data) => data?.chatId == ctx.request.body?.message?.chat?.id
        //   );
        //   if (existingChat?.length == 0) {
        //     await strapi.entityService.update(
        //       "api::telegram-bot.telegram-bot",
        //       1,
        //       {
        //         data: {
        //           pastGroups: [
        //             ...data.pastGroups,
        //             {
        //               chatId: ctx.request.body?.message?.chat?.id,
        //               title: ctx.request.body?.message?.chat?.title,
        //             },
        //           ],
        //         },
        //       }
        //     );
        //   }
        //   await strapi
        //     .service("api::telegram-bot.telegram-bot")
        //     .triggerService({
        //       method: "post",
        //       endpoint: "sendMessage",
        //       body: {
        //         chat_id: ctx.request.body?.message?.chat?.id,
        //         text: data?.welcomeMessage,
        //       },
        //     });
        //   ctx.body = true;
        // } catch (error) {
        //   await strapi
        //     .service("api::telegram-bot.telegram-bot")
        //     .triggerService({
        //       method: "post",
        //       endpoint: "sendMessage",
        //       body: {
        //         chat_id: data?.chats?.errorGroupChatId,
        //         text:
        //           "There was an error in the controller, chat ID was " +
        //           data?.chats?.notificationsGroupChatId +
        //           " and the error was " +
        //           JSON.stringify(error),
        //       },
        //     });
        //   ctx.body = true;
        // }
      } catch (error) {
        console.log("Internal Server Error");
        console.log(error);
        ctx.internalServerError = error;
      }
    },
  })
);
