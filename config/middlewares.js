module.exports = [
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: ["*", "Authorization", "Content-Type", "Accept"],
      origin: [
        "*",
        "https://meet.iskconincedu.com",
        "https://chat.iskconincedu.com",
        "https://krishnaconsciousnesssociety.com",
        "https://api.krishnaconsciousnesssociety.com",
        "https://www.krishnaconsciousnesssociety.com",
      ],
    },
  },
  "strapi::poweredBy",
  "strapi::logger",
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];
