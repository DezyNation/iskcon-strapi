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

          // Format key in bold and add a new line
          markdown += `**${key}**:\n`;

          // Recursively process nested objects
          if (typeof value === "object" && value !== null) {
            markdown += jsonToMarkdown(value, depth + 1);
          } else {
            // Format value and add a semicolon
            markdown += "  ".repeat(depth + 1) + `${value};\n`;
          }
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

    if (!botData?.chats) return true;
    strapi.service("api::telegram-bot.telegram-bot").triggerService({
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
