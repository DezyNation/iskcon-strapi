const moment = require("moment-timezone");

module.exports = {
  async afterCreate(event) {
    const { result, params } = event;

    function jsonToMarkdown(json, depth = 0) {
      if (typeof json !== "object" || json === null) {
        return json; // return non-object values as is
      }

      let markdown = "";

      for (const key in json) {
        if (json.hasOwnProperty(key)) {
          const value = json[key];

          // Add indentation based on depth
          markdown += "  ".repeat(depth);

          // Format key and value on the same line
          markdown += `${key}: ${formatValue(value)}  \n`;
        }
      }

      return markdown;
    }

    function formatValue(value) {
      if (typeof value === "object" && value !== null) {
        // Recursively process nested objects
        return jsonToMarkdown(value, 0);
      } else if (value instanceof Date) {
        // Convert Date objects to human-readable timestamp in IST
        return moment(value).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss z");
      } else {
        // Return other values as is
        return value;
      }
    }

    const message = jsonToMarkdown(result);
    const botData = await strapi.entityService.findMany(
      "api::telegram-bot.telegram-bot",
      {
        fields: ["chats"],
      }
    );

    if (!botData?.chats) return true;
    await strapi.service("api::telegram-bot.telegram-bot").triggerService({
      method: "post",
      endpoint: "sendMessage",
      body: {
        chat_id: botData?.chats?.notificationsGroupChatId,
        text: message,
      },
    });

    return true;
  },
};
