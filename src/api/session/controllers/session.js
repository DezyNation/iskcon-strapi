"use strict";

const { default: axios } = require("axios");

/**
 * session controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::session.session", ({ strapi }) => ({
  createNewSession: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const { title, course, coHost, preacher, startAt, intent } =
        ctx.request.body;

      const meetingLink = await axios.post(
        `${process.env.CONFERENCE_BASE_URL}/api/v1/join`,
        {
          room: user?.username + title?.toLowerCase()?.replace(/ /g, "-"),
          password: "false",
          name: user?.username,
          audio: "true",
          video: "false",
          screen: "false",
          notify: "false",
        },
        {
          headers: {
            authorization: "mirotalksfu_default_secret",
          },
        }
      );
      if (meetingLink.status != 200) {
        ctx.status = 500;
        ctx.body = meetingLink;
      }
      const result = await strapi.entityService.create("api::session.session", {
        data: {
          ...ctx.request.body,
          coHost: {
            connect: [coHost],
          },
          preacher: {
            connect: [preacher],
          },
          course: {
            connect: [course],
          },
          hostedLink: meetingLink.data?.join,
        },
      });

      if (intent == "schedule") {
        const preacherInfo = await strapi.entityService.findOne(
          "api::users-permissions.user",
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
            description: `<i>Hare Krishna</i><br/> Join an upcoming session <b>${title}</b> with ${preacherInfo?.name} at ${startAt}`,
          },
        });
      }

      ctx.body == result;
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
            "course",
            "coHost",
            "qnaStatus",
            "donationStatus",
            "audioStatus",
            "videoStatus",
            "startAt",
            "duration",
            "language",
            "posterUrl",
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
                      fields: ["avatar"],
                    },
                  },
                },
              },
            },
            preacher: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["avatar"],
                },
              },
            },
            coHost: {
              fields: ["name", "username"],
              populate: {
                avatar: {
                  fields: ["avatar"],
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
