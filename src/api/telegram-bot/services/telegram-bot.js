"use strict";

const { default: axios } = require("axios");

/**
 * telegram-bot service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService(
  "api::telegram-bot.telegram-bot",
  ({ strapi }) => ({
    triggerService: async (ctx) => {
      try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const { method, body, queryParams, endpoint } = ctx;
        let res;
        if (method == "post") {
          res = await axios.post(
            `https://api.telegram.org/bot${token}/${endpoint}`,
            {
              ...body,
            }
          );
        } else {
          res = await axios.get(
            `https://api.telegram.org/bot${token}/${endpoint}`
          );
        }
        return res;
      } catch (error) {
        console.log(error);
        throw new Error("Error occured while triggering Telegram Bot API");
      }
    },
  })
);
