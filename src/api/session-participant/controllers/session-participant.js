"use strict";

const pusher = require("../../../../config/pusher");

/**
 * session-participant controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::session-participant.session-participant",
  ({ strapi }) => ({
    allParticipants: async (ctx, next) => {
      try {
        const { sessionId } = ctx.query;
        const participants = await strapi.entityService.findMany(
          "api::session-participant.session-participant",
          {
            fields: ["id", "createdAt", "updatedAt", "joinCount", "leftAt"],
            filters: {
              session: sessionId,
            },
            populate: {
              user: {
                fields: ["id", "username", "name"],
                populate: {
                  avatar: {
                    fields: ["url"],
                  },
                },
              },
            },
          }
        );
        ctx.body = participants;
      } catch (error) {
        ctx.body = error;
      }
    },
    addMe: async (ctx, next) => {
      try {
        const { sessionId } = ctx.body;
        const { user } = ctx.state;
        const alreadyJoined = await strapi.entityService.findMany(
          "api::session-participant.session-participant",
          {
            fields: ["id", "createdAt", "updatedAt", "joinCount", "leftAt"],
            filters: {
              $and: [
                {
                  session: parseInt(sessionId),
                },
                {
                  user: parseInt(user?.id),
                },
              ],
            },
            populate: {
              user: {
                fields: ["id", "username", "name"],
                avatar: {
                  fields: ["id", "url"],
                },
              },
            },
          }
        );

        if (alreadyJoined?.length) {
          const updateJoinCount = await strapi.entityService.update(
            "api::session-participant.session-participant",
            alreadyJoined[0]?.id,
            {
              data: {
                joinCount: alreadyJoined[0]?.joinCount,
                leftAt: null,
              },
            }
          );
          try {
            await pusher.trigger(
              `session-${sessionId}`,
              "participantsListUpdate",
              {
                userJoined: alreadyJoined[0]?.user,
              }
            );
          } catch (error) {
            ctx.status = 500;
            ctx.body = error;
          }
          ctx.body = updateJoinCount;
          return;
        }

        const newParticipant = await strapi.entityService.create(
          "api::session-participant.session-participant",
          {
            data: {
              user: {
                connect: [parseInt(user?.id)],
              },
              session: {
                connect: [parseInt(sessionId)],
              },
            },
            populate: {
              user: {
                fields: ["id", "username", "name"],
                avatar: {
                  fields: ["id", "url"],
                },
              },
            },
          }
        );

        try {
          await pusher.trigger(
            `session-${sessionId}`,
            "participantsListUpdate",
            {
              userJoined: newParticipant,
            }
          );
        } catch (error) {
          ctx.status = 500;
          ctx.body = error;
        }

        ctx.body = newParticipant;
      } catch (error) {
        ctx.body = error;
      }
    },

    removeMe: async (ctx, next) => {
      try {
        const { sessionId } = ctx.body;
        const { user } = ctx.state;
        const now = new Date();
        const alreadyJoined = await strapi.entityService.findMany(
          "api::session-participant.session-participant",
          {
            fields: ["id", "createdAt", "updatedAt", "joinCount", "leftAt"],
            filters: {
              $and: [
                {
                  session: parseInt(sessionId),
                },
                {
                  user: parseInt(user?.id),
                },
              ],
            },
            populate: {
              user: {
                fields: ["id", "username", "name"],
                avatar: {
                  fields: ["id", "url"],
                },
              },
            },
          }
        );
        if (alreadyJoined?.length) {
          const updateInfo = await strapi.entityService.update(
            "api::session-participant.session-participant",
            alreadyJoined[0]?.id,
            {
              data: {
                leftAt: now,
              },
            }
          );
          try {
            await pusher.trigger(
              `session-${sessionId}`,
              "participantsListUpdate",
              {
                userLeft: alreadyJoined[0]?.user,
              }
            );
          } catch (error) {
            ctx.status = 500;
            ctx.body = error;
          }
          ctx.body = updateInfo;
          return;
        }

        ctx.body = { message: "You didn't join this session" };
      } catch (error) {
        ctx.body = error;
      }
    },

    notify: async (ctx, next) => {
      try {
        const { sessionId, eventName, data } = ctx.body;
        const { user } = ctx.state;
        if (!sessionId || !eventName || data) {
          ctx.status = 406;
          ctx.body = { message: "Invalid or incomplete request body" };
          return;
        }
        if (!user) {
          ctx.status = 403;
          ctx.body = { message: "You're not allowed to trigger notifications" };
          return;
        }
        try {
          await pusher.trigger(`session-${sessionId}`, eventName, {
            ...data,
          });
        } catch (error) {
          ctx.status = 500;
          ctx.body = error;
        }
      } catch (error) {
        ctx.body = error;
      }
    },
  })
);
