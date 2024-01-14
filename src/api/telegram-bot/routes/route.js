module.exports = {
  routes: [
    {
      method: ["POST", "GET"],
      path: "/tg-bot/webhook",
      handler: "telegram-bot.webhookResponse",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
