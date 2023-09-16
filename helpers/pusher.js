"use client"
const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET_KEY,
  useTLS: true,
  host: process.env.PUSHER_BASE_URL,
});

export default pusher