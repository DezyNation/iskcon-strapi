"use strict";

const { default: axios } = require("axios");

const now = new Date();
const yesterday = now.setDate(now.getDate() - 1);
const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

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
            startAt: {
              $gte: now.toISOString(),
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
            startAt: {
              $gt: now.toISOString(),
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
            $and: [
              {
                startAt: { $gte: sixHoursAgo.toISOString() },
              },
              {
                startAt: { $lte: now.toISOString() },
              },
            ],
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
}));
