"use strict";

/**
 * question controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::question.question",
  ({ strapi }) => ({
    ask: async (ctx, next) => {
      try {
        const {user} = ctx.state
        const {question} = ctx.request.body
        const {sessionId} = ctx.params
        const result = await strapi.entityService.create("api::question.question", {
            data: {
                user: {
                    connect: [user.id]
                },
                session: {
                    connect : [sessionId]
                },
                question: question
            },
            populate: {
                user: {
                    fields: ['name', 'username'],
                    populate: {
                        avatar: {
                            fields: ['url']
                        }
                    }
                }
            }
        })
        ctx.body = result 
      } catch (error) {
        ctx.body = error
      }
    },
    view: async (ctx, next) => {
      try {
        const {sessionId} = ctx.params
        const result = await strapi.entityService.findMany("api::question.question", {
            fields: ['question', 'beingAnswered', 'isAnswered', 'createdAt'],
            filters: {
                session: {
                    id: sessionId
                }
            },
            populate: {
                user: {
                    fields: ['name', 'username'],
                    populate: {
                        avatar: {
                            fields: ['url']
                        }
                    }
                }
            }
        })
        ctx.body = result
      } catch (error) {
        ctx.body = error
      }
    }
  })
);
