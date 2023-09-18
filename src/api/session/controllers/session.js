"use strict";

// const { default: pusher } = require("../../../../helpers/pusher");
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET_KEY,
  useTLS: true,
  host: process.env.PUSHER_BASE_URL,
  port: "443",
});

const now = new Date();

/**
 * session controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::session.session", ({ strapi }) => ({
  createNewSession: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const { title, course, coHost, preacher, startAt, slug, intent } =
        ctx.request.body;

      const result = await strapi.entityService.create("api::session.session", {
        data: {
          ...ctx.request.body,
          ...(parseInt(coHost) > 1 && {
            coHost: {
              connect: [parseInt(coHost)],
            },
          }),
          startAt: startAt ? startAt : now.toISOString(),
          preacher: {
            connect: [parseInt(preacher)],
          },
          ...(parseInt(course) > 1 && {
            course: {
              connect: [parseInt(course)],
            },
          }),
          status: intent == "create" ? "ongoing" : "upcoming",
          hostedLink: `${process.env.CONFERENCE_BASE_URL}/join/${slug}`,
        },
      });

      if (intent == "schedule") {
        const preacherInfo = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          preacher,
          {
            fields: ["username", "name"],
          }
        );

        await strapi.entityService.create("api::post.post", {
          data: {
            creator: {
              connect: [user.id],
            },
            description: `<i>Hare Krishna</i><br/> Join an upcoming session <b>${title}</b> with ${
              preacherInfo?.name
            } at ${new Date(startAt).toLocaleString(undefined, {
              timeZone: "Asia/Kolkata",
            })} <br/>
            Join with <a href="${
              process.env.FRONTEND_URL
            }/dashboard/sessions/join/${slug}" target="_blank">this link</a>
            `,
          },
        });
      }

      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  getAllSessions: async (ctx, next) => {
    try {
      const result = await strapi.entityService.findMany(
        "api::session.session",
        {
          fields: [
            "title",
            "description",
            "qnaStatus",
            "donationStatus",
            "audioStatus",
            "videoStatus",
            "startAt",
            "duration",
            "language",
            "posterUrl",
            "slug",
          ],
          filters: {
            status: {
              $ne: "ended",
            },
          },
          populate: {
            course: {
              fields: ["title", "description", "posterUrl"],
              populate: {
                poster: {
                  fields: ["url"],
                },
                preacher: {
                  fields: ["name", "username"],
                  populate: {
                    avatar: {
                      fields: ["url"],
                    },
                  },
                },
              },
            },
            preacher: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
            coHost: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
          },
          sort: { startAt: "desc" },
          page: 1,
          pageSize: 15,
        }
      );
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  getSessionInfo: async (ctx, next) => {
    try {
      const { slug } = ctx.params;
      const session = await strapi.entityService.findMany(
        "api::session.session",
        {
          filters: {
            slug: slug,
          },
        }
      );
      if (!session.length) {
        ctx.status = 404;
        ctx.body = {
          error: {
            message: "No session found with given slug",
          },
        };
        return;
      }
      const result = await strapi.entityService.findOne(
        "api::session.session",
        session[0]?.id,
        {
          fields: [
            "title",
            "description",
            "qnaStatus",
            "donationStatus",
            "audioStatus",
            "videoStatus",
            "startAt",
            "language",
            "posterUrl",
            "hostedLink",
            "slug",
          ],
          populate: {
            course: {
              fields: ["title", "description", "posterUrl"],
              populate: {
                poster: {
                  fields: ["url"],
                },
                preacher: {
                  fields: ["name", "username"],
                  populate: {
                    avatar: {
                      fields: ["url"],
                    },
                  },
                },
              },
            },
            preacher: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
            coHost: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
          },
        }
      );
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  getUpcomingSessions: async (ctx, next) => {
    try {
      const result = await strapi.entityService.findMany(
        "api::session.session",
        {
          fields: [
            "title",
            "description",
            "qnaStatus",
            "donationStatus",
            "audioStatus",
            "videoStatus",
            "startAt",
            "language",
            "posterUrl",
            "slug",
          ],
          filters: {
            status: "upcoming",
          },
          populate: {
            course: {
              fields: ["title", "description", "posterUrl"],
              populate: {
                poster: {
                  fields: ["url"],
                },
                preacher: {
                  fields: ["name", "username"],
                  populate: {
                    avatar: {
                      fields: ["url"],
                    },
                  },
                },
              },
            },
            preacher: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
            coHost: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
          },
        }
      );
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  getOngoingSessions: async (ctx, next) => {
    try {
      const result = await strapi.entityService.findMany(
        "api::session.session",
        {
          fields: [
            "title",
            "description",
            "qnaStatus",
            "donationStatus",
            "audioStatus",
            "videoStatus",
            "startAt",
            "language",
            "posterUrl",
            "slug",
          ],
          filters: {
            status: "ongoing",
          },
          populate: {
            course: {
              fields: ["title", "description", "posterUrl"],
              populate: {
                poster: {
                  fields: ["url"],
                },
                preacher: {
                  fields: ["name", "username"],
                  populate: {
                    avatar: {
                      fields: ["url"],
                    },
                  },
                },
              },
            },
            preacher: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
            coHost: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["url"],
                },
              },
            },
          },
        }
      );
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  startSession: async (ctx, next) => {
    try {
      const { sessionId } = ctx.request.body;
      const result = strapi.entityService.update(
        "api::session.session",
        parseInt(sessionId),
        {
          data: {
            status: "ongoing",
          },
          fields: ["slug"],
        }
      );
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  stopSession: async (ctx, next) => {
    try {
      const { sessionId } = ctx.request.body;
      const result = strapi.entityService.update(
        "api::session.session",
        parseInt(sessionId),
        {
          data: {
            status: "ended",
          },
          fields: ["slug"],
        }
      );
      await pusher.trigger(`session-${sessionId}`, "sessionUpdate", {
        status: "ended",
      });
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  updateSessionData: async (ctx, next) => {
    try {
      const { sessionId, data } = ctx.request.body;
      const result = await strapi.entityService.update(
        "api::session.session",
        parseInt(sessionId),
        {
          data: data,
          fields: [
            "slug",
            "qnaStatus",
            "audioStatus",
            "videoStatus",
            "donationStatus",
            "status",
          ],
        }
      );
      
      await pusher.trigger(`session-${sessionId}`, "sessionUpdate", {
        data: data,
        status: result?.status,
      });
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
}));
