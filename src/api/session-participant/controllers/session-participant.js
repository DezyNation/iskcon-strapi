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
            fields: [
              "id",
              "createdAt",
              "updatedAt",
              "joinCount",
              "leftAt",
              "joinedAt",
              "micStatus",
              "cameraStatus",
              "isCoHost",
              "isPreacher",
              "handRaised",
            ],
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

    me: async (ctx, next) => {
      try {
        const { sessionId } = ctx.request.body;
        const { user } = ctx.state;

        if (!user) {
          return ctx.unauthorised("Unauthorised request");
        }

        if (!sessionId) {
          return ctx.badRequest("Session ID is missing");
        }

        const result = await strapi.entityService.findMany(
          "api::session-participant.session-participant",
          {
            fields: [
              "id",
              "createdAt",
              "updatedAt",
              "joinCount",
              "leftAt",
              "joinedAt",
              "micStatus",
              "cameraStatus",
              "isCoHost",
              "isPreacher",
              "handRaised",
            ],
            filters: {
              $and: [
                {
                  session: {
                    id: parseInt(sessionId),
                  },
                  user: {
                    id: parseInt(user?.id),
                  },
                },
              ],
            },
          }
        );

        if (!result?.length) {
          return ctx.notFound("Participant info not found!");
        }
        ctx.body = result;
      } catch (error) {
        ctx.internalServerError(error);
      }
    },

    addMe: async (ctx, next) => {
      try {
        const now = new Date();
        const { sessionId } = ctx.body;
        const { user } = ctx.state;
        const alreadyJoined = await strapi.entityService.findMany(
          "api::session-participant.session-participant",
          {
            fields: [
              "id",
              "createdAt",
              "updatedAt",
              "joinCount",
              "leftAt",
              "joinedAt",
              "micStatus",
              "cameraStatus",
              "isCoHost",
              "isPreacher",
              "handRaised",
            ],
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
                  fields: ["url"],
                },
              },
            },
          }
        );

        // If the user has already joined the session
        if (alreadyJoined?.length) {
          const updatedParticipant = await strapi.entityService.update(
            "api::session-participant.session-participant",
            alreadyJoined[0]?.id,
            {
              fields: [
                "id",
                "createdAt",
                "updatedAt",
                "joinCount",
                "leftAt",
                "joinedAt",
                "micStatus",
                "cameraStatus",
                "isCoHost",
                "isPreacher",
                "handRaised",
              ],
              data: {
                joinCount: alreadyJoined[0]?.joinCount,
                joinedAt: now,
                leftAt: null,
              },
            }
          );
          try {
            await pusher.trigger(`session-${sessionId}`, "participantsUpdate", {
              userJoined: updatedParticipant,
            });
          } catch (error) {
            ctx.status = 500;
            ctx.body = error;
          }
          ctx.body = updatedParticipant;
          return;
        }

        // If new user has joined
        const newParticipant = await strapi.entityService.create(
          "api::session-participant.session-participant",
          {
            fields: [
              "id",
              "createdAt",
              "updatedAt",
              "joinCount",
              "leftAt",
              "joinedAt",
              "micStatus",
              "cameraStatus",
              "isCoHost",
              "isPreacher",
              "handRaised",
            ],
            data: {
              user: {
                connect: [parseInt(user?.id)],
              },
              session: {
                connect: [parseInt(sessionId)],
              },
              joinedAt: now,
            },
            populate: {
              user: {
                fields: ["id", "username", "name"],
                avatar: {
                  fields: ["url"],
                },
              },
            },
          }
        );

        try {
          await pusher.trigger(`session-${sessionId}`, "participantsUpdate", {
            user: newParticipant,
          });
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
            fields: [
              "id",
              "createdAt",
              "updatedAt",
              "joinCount",
              "leftAt",
              "joinedAt",
              "micStatus",
              "cameraStatus",
              "isCoHost",
              "isPreacher",
              "handRaised",
            ],
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
                  fields: ["url"],
                },
              },
            },
          }
        );
        if (alreadyJoined?.length) {
          const updatedParticipant = await strapi.entityService.update(
            "api::session-participant.session-participant",
            alreadyJoined[0]?.id,
            {
              data: {
                leftAt: now,
              },
            }
          );
          try {
            await pusher.trigger(`session-${sessionId}`, "participantsUpdate", {
              user: updatedParticipant,
            });
          } catch (error) {
            ctx.status = 500;
            ctx.body = error;
          }
          ctx.body = updatedParticipant;
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
          ctx.badRequest("Invalid or incomplete request body");
          return;
        }
        if (!user) {
          ctx.badRequest("You're not allowed to trigger notifications");
          return;
        }

        await pusher.trigger(`session-${sessionId}`, eventName, {
          ...data,
        });
      } catch (error) {
        ctx.body = error;
      }
    },

    updateParticipant: async (ctx, next) => {
      try {
        const { sessionId, participantId, permission } = ctx.body;
        const { user } = ctx.state;
        if (!sessionId || !participantId || !permission) {
          return ctx.badRequest("Invalid or incomplete request body");
        }

        if (!user) {
          return ctx.forbidden("You're not allowed to make updates");
        }

        if (!participantId) {
          return ctx.badRequest("Need participant info to update permission");
        }

        const session = await strapi.entityService.findMany(
          "api::session.session",
          {
            fields: ["id", "micStatus", "cameraStatus", "status"],
            filters: {
              $and: [
                {
                  id: parseInt(sessionId),
                },
                {
                  status: "ongoing",
                },
              ],
            },
            populate: {
              preacher: {
                fields: ["id"],
              },
            },
          }
        );

        if (!session?.length) {
          return ctx.notFound("Session does not exist");
        }

        const alreadyJoined = await strapi.entityService.findMany(
          "api::session-participant.session-participant",
          {
            fields: [
              "id",
              "createdAt",
              "updatedAt",
              "joinCount",
              "leftAt",
              "joinedAt",
              "micStatus",
              "cameraStatus",
            ],
            filters: {
              $and: [
                {
                  session: parseInt(sessionId),
                },
                {
                  user: parseInt(participantId),
                },
              ],
            },
            populate: {
              user: {
                fields: ["id", "username", "name"],
                avatar: {
                  fields: ["url"],
                },
              },
            },
          }
        );

        if (!alreadyJoined?.length) {
          return ctx.notFound("You didn't join this session");
        }

        // If the user has already joined the session
        if (alreadyJoined?.length) {
          if (
            permission?.micStatus &&
            !session[0]?.micStatus &&
            session[0]?.preacher?.id != participantId &&
            !alreadyJoined[0]?.isCoHost
          ) {
            return ctx.notAcceptable("Preacher has disabled mic access");
          }

          const updatedParticipant = await strapi.entityService.update(
            "api::session-participant.session-participant",
            alreadyJoined[0]?.id,
            {
              fields: [
                "id",
                "createdAt",
                "updatedAt",
                "joinCount",
                "leftAt",
                "joinedAt",
                "micStatus",
                "cameraStatus",
              ],
              data: {
                ...permission,
              },
            }
          );

          try {
            await pusher.trigger(`session-${sessionId}`, "permissionUpdate", {
              user: updatedParticipant,
            });
          } catch (error) {
            ctx.status = 500;
            ctx.body = error;
          }
          ctx.body = updatedParticipant;
          return;
        }
      } catch (error) {
        ctx.body = error;
      }
    },
  })
);
