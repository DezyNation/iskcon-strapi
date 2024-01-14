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
          markdown += `${key}: ${value}\n`;
        }
      }

      return markdown;
    }

    const message = jsonToMarkdown(result);
    const botData = await strapi.entityService.findMany(
      "api::telegram-bot.telegram-bot",
      {
        fields: ["chats"],
      }
    );

    if (!botData?.chats?.notificationsGroupStatus) return true;
    try {
      await strapi.service("api::telegram-bot.telegram-bot").triggerService({
        method: "post",
        endpoint: "sendMessage",
        body: {
          chat_id: botData?.chats?.notificationsGroupChatId,
          text: message,
        },
      });
      return true;
    } catch (error) {
      console.log("Error while sending form notification");
      console.log(error);
      return true;
    }
  },
};
