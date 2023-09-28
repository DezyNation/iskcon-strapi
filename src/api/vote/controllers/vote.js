"use strict";

/**
 * vote controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const bcrypt = require("bcrypt");

module.exports = createCoreController("api::vote.vote", ({ strapi }) => ({
  casteVote: async (ctx, next) => {
    try {
      const { candidateId, secretPin, location } = ctx.body;
      const { ip } = ctx.request;
      if (!ip) {
        return ctx.badRequest("Invalid or Missing IP");
      }

      if (!location || !candidateId || !secretPin) {
        return ctx.badRequest("Please provide your location and pin");
      }

      const candidate = await strapi.entityService.findMany(
        "api::candidate.candidate",
        {
          fields: ["id"],
          filters: {
            id: parseInt(candidateId),
          },
        }
      );

      if (!candidate?.length) {
        return ctx.badRequest("Candidate not found");
      }

      const volunteer = await strapi.entityService.findMany(
        "api::volunteer.volunteer",
        {
          fields: ["id"],
          filters: {
            idNumber: parseInt(secretPin),
          },
        }
      );

      if (!volunteer?.length) {
        return ctx.badRequest("Invalid PIN");
      }

      const existingVote = await strapi.entityService.findMany("api::vote.vote", {
        fields: ['id', 'isValid', 'token', 'createdAt'],
        filters: {
            $and: [
                {
                    isValid: true
                },
                {
                    $or : [
                        {
                            ip: ip
                        },
                        {
                            location: location
                        }
                    ]
                }
            ]
        }
      })

      if(existingVote.length){
        return ctx.badRequest('You have already voted')
      }

      const salt = process.env.BCRYPT_SALT;
      const token = bcrypt.hashSync(secretPin, salt);
      if (token) {
        const result = await strapi.entityService.create("api::vote.vote", {
          fields: ["id", "token", "createdAt", "isValid"],
          data: {
            token: token,
            candidate: {
              connect: [parseInt(candidate[0].id)],
            },
            ip: ip,
            location: location,
          },
        });
      }
    } catch (error) {
      ctx.body = error;
    }
  },
}));
