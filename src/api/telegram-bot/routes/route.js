module.exports = {
  routes: [
    {
      method: "POST",
      path: "/tg-bot/webhook",
      handler: "telegram-bot.webhookResponse",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
