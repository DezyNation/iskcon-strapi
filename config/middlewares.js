module.exports = [
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "connect-src": ["'self'", "https:"],
          "img-src": ["'self'", "data:", "blob:", process.env.BUNNY_PULL_ZONE],
          "media-src": [
            "'self'",
            "data:",
            "blob:",
            process.env.BUNNY_PULL_ZONE,
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
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
