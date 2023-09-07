module.exports = ({ env }) => ({
  email: {
    config: {
      provider: env("EMAIL_PROVIDER", "nodemailer"),
      providerOptions: {
        host: env("SMTP_HOST", "smtp.example.com"),
        port: env("SMTP_PORT", 587),
        auth: {
          user: env("SMTP_USERNAME"),
          pass: env("SMTP_PASSWORD"),
        },
        settings: {
          defaultFrom: env("SMTP_USERNAME"),
        },
      },
    },
  },
  upload: {
    config: {
      provider: "strapi-provider-upload-bunnynet",
      providerOptions: {
        api_key: env("BUNNY_API_KEY"),
        storage_zone: env("BUNNY_STORAGE_ZONE"),
        pull_zone: env("BUNNY_PULL_ZONE"),
        host_name: env("BUNNY_HOST_NAME"),
      },
    },
  },
  "strapi-plugin-populate-deep": {
    config: {
      defaultDepth: 5, // Default is 5
    },
  },
  "users-permissions": {
    config: {
      ratelimit: {
        interval: 60000,
        max: 100000,
      },
    },
  },
});
