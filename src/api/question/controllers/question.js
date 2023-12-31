"use strict";

const pusher = require("../../../../config/pusher");

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::question.question",
  ({ strapi }) => ({
    ask: async (ctx, next) => {
      try {
        const { user } = ctx.state;
        const { question } = ctx.request.body;
        const { sessionId } = ctx.params;
        const result = await strapi.entityService.create(
          "api::question.question",
          {
            data: {
              user: {
                connect: [user.id],
              },
              session: {
                connect: [sessionId],
              },
              question: question,
            },
            populate: {
              user: {
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
        await pusher.trigger(`session-${sessionId}`, "messageUpdate", {
          msg: "newMsg",
        });
        ctx.body = result;
      } catch (error) {
        ctx.body = error;
      }
    },
    view: async (ctx, next) => {
      try {
        const { sessionId } = ctx.params;
        const result = await strapi.entityService.findMany(
          "api::question.question",
          {
            fields: ["question", "beingAnswered", "isAnswered", "createdAt"],
            filters: {
              session: {
                id: sessionId,
              },
            },
            populate: {
              user: {
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
    updateQuestion: async (ctx, next) => {
      try {
        const { data } = ctx.request.body;
        const { id } = ctx.params;
        const result = await strapi.entityService.update(
          "api::question.question",
          parseInt(id),
          {
            data: data,
            populate: {
              session: {
                fields: ["id"],
              },
            },
          }
        );
        await pusher.trigger(`session-${result?.session?.id}`, "messageUpdate", {
          msg: "msgUpdate"
        });
        ctx.body = result
      } catch (error) {
        ctx.body = error
      }
    },
  })
);
