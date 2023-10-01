"use strict";

/**
 * vote controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const bcrypt = require("bcrypt");

module.exports = createCoreController("api::vote.vote", ({ strapi }) => ({
  casteVote: async (ctx, next) => {
    try {
      const { candidateId, secretPin, location } = ctx.request.body;
      const { ip } = ctx.request;

      const election = await strapi.entityService.findOne(
        "api::election-control.election-control",
        1,
        {
          fields: ["id", "status", "totalVotes"],
        }
      );

      if (election?.status != "ongoing") {
        return ctx.badRequest("Election is not ongoing");
      }

      if (!ip) {
        return ctx.badRequest("Invalid or Missing IP");
      }

      if (!candidateId || !secretPin) {
        return ctx.badRequest("Please provide your pin");
      }

      const candidate = await strapi.entityService.findMany(
        "api::candidate.candidate",
        {
          fields: ["id"],
          filters: {
            volunteer: {
              idNumber: parseInt(candidateId),
            },
          },
        }
      );

      if (!candidate?.length) {
        return ctx.badRequest("Candidate not found");
      }

      const volunteer = await strapi.entityService.findMany(
        "api::volunteer.volunteer",
        {
          fields: ["id", "canVote"],
          filters: {
            idNumber: parseInt(secretPin),
          },
        }
      );

      if (!volunteer?.length) {
        return ctx.badRequest("Invalid PIN");
      }

      if (!volunteer[0]?.canVote) {
        return ctx.badRequest("You are currently unable to cast a vote");
      }

      if (secretPin == candidateId) {
        return ctx.badRequest("Cannot Vote for yourself");
      }

      const existingVote = await strapi.entityService.findMany(
        "api::vote.vote",
        {
          fields: ["id", "isValid", "token", "createdAt"],
          filters: {
            $and: [
              {
                isValid: true,
              },
              {
                ip: ip,
              },
            ],
          },
        }
      );

      if (
        existingVote.length &&
        bcrypt.compareSync(secretPin, existingVote[0]?.token)
      ) {
        return ctx.badRequest("You have already voted");
      }

      const salt = 4;
      const token = bcrypt.hashSync(secretPin, salt);

      if (token) {
        const result = await strapi.entityService.create("api::vote.vote", {
          fields: ["id", "token", "createdAt", "isValid"],
          data: {
            token: token,
            candidate: {
              connect: [parseInt(candidate[0].id)],
            },
            ip: ip
          },
        });
        await strapi.entityService.update(
          "api::volunteer.volunteer",
          volunteer[0]?.id,
          {
            fields: ["id", "canVote"],
            data: {
              canVote: false,
            },
          }
        );
        await strapi.entityService.update(
          "api::election-control.election-control",
          1,
          {
            data: {
              totalVotes: parseInt(election?.totalVotes) + 1,
            },
          }
        );
        console.log("Result");
        console.log(result);
        ctx.body = {
          ...result,
          voterId: volunteer[0]?.idNumber,
          voterName: volunteer[0]?.name,
        };
      }
    } catch (error) {
      ctx.body = error;
    }
  },
  getValidVotes: async (ctx, next) => {
    try {
      const result = await strapi.entityService.findMany("api::vote.vote", {
        fields: ["token", "location", "ip", "createdAt", "isVerified"],
        filters: {
          isValid: true,
        },
        populate: {
          candidate: {
            fields: ["post"],
            populate: {
              volunteer: {
                fields: ["id", "name", "email", "avatar", "canVote"],
              },
            },
          },
        },
      });
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  result: async (ctx, next) => {
    try {
      const result = await strapi.entityService.findMany(
        "api::candidate.candidate",
        {
          fields: ["id", "post"],
          populate: {
            votes: {
              filters: {
                isValid: true,
              },
              fields: ["isValid", "token", "createdAt"],
            },
            volunteer: {
              fields: ["id", "name", "email", "avatar", "idNumber"],
            },
          },
        }
      );
      ctx.body = result;
    } catch (error) {
      ctx.body = error;
    }
  },
  verify : async (ctx, next) => {
    try {
      const { secretPin, candidatedId } = ctx.request.body
      if(!secretPin || !candidatedId){
        return ctx.badRequest('Missing required parameters')
      }

      let tokens = []

      // get all votes of the candidate
      const votes = await strapi.entityService.findMany("api::vote.vote", {
        fields: ['isValid', 'createdAt', 'token', 'isVerified'],
        filters: {
          candidate :{
            volunteer: {
              idNumber: parseInt(candidatedId)
            }
          }
        },
        populate: {
          candidate: {
            populate: {
              volunteer: {
                fields: ['idNumber', 'name', 'avatar']
              }
            }
          }
        }
      })

      if(!votes?.length){
        return ctx.badRequest('No tokens found')
      }

      for (let i = 0; i < votes?.length; i++) {
        const vote = votes[i];
        if(bcrypt.compareSync(secretPin, vote?.token)){
          tokens?.push(vote)
        }
      }

      if(!tokens?.length){
        return ctx.badRequest('Token Not Found!')
      }

      ctx.body = tokens

    } catch (error) {
      ctx.body = error
    }
  }
}));
