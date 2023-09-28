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
              "isPreacher"
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
              "isPreacher"
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
              "isPreacher"
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
            userJoined: newParticipant,
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
              "isPreacher"
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
              userLeft: updatedParticipant,
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
          // If admin has updated participants permission
          if (eventName == "permissionUpdate") {
            const { participantId, permission } = data;
            if (!participantId) {
              ctx.status = 400;
              ctx.body = {
                message: "Need participant info to update permission",
              };
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
                  ],
                  data: {
                    ...permission,
                  },
                }
              );
              try {
                await pusher.trigger(`session-${sessionId}`, eventName, {
                  userUpdated: updatedParticipant,
                });
              } catch (error) {
                ctx.status = 500;
                ctx.body = error;
              }
              ctx.body = updatedParticipant;
              return;
            }
          } else {
            await pusher.trigger(`session-${sessionId}`, eventName, {
              ...data,
            });
          }
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
