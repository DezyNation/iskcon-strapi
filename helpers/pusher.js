const Pusher = require("pusher");

const pusher = new Pusher({
  key: process.env.PUSHER_APP_KEY,
  host: process.env.PUSHER_BASE_URL,
  appId: process.env.PUSHER_APP_ID,
  secret: process.env.PUSHER_SECRET_KEY,
  port: process.env.PUSHER_PORT,
  cluster: "ap2"
});

module.exports = pusher;
