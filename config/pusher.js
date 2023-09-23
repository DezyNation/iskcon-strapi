const Pusher = require("pusher");

const pusher = new Pusher({
  host: process.env.PUSHER_BASE_URL,
  port: process.env.PUSHER_PORT,
  key: process.env.PUSHER_APP_KEY,
  appId: process.env.PUSHER_APP_ID,
  secret: process.env.PUSHER_SECRET_KEY,
  useTLS: true,
  cluster: "ap2"
});

module.exports = pusher;
