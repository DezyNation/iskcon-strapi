module.exports = [
  "strapi::errors",
  "strapi::security",
  {
    name: "strapi::cors",
    config: {
      enabled: true,
      headers: "*",
      origin: [
        "http://localhost:1337",
        "https://api.iskconincedu.com",
        "https://meet.iskconincedu.com",
        "https://chat.iskconincedu.com",
        "https://krishnaconsciousnesssociety.com",
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
