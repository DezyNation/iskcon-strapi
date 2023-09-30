"use strict";

/**
 * vote controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const bcrypt = require("bcrypt");

module.exports = createCoreController("api::vote.vote", ({ strapi }) => ({
  casteVote: async (ctx, next) => {
    try {
      console.log("Initiating...")
      const { candidateId, secretPin, location, ip } = ctx.body;

      console.log("Starting...")
      const election = await strapi.entityService.findOne(
        "api::election-control.election-control",
        1,
        {
          fields: ["id", "status", "totalVotes"],
        }
      );
      console.log("Election")
      console.log(election)

      if (election?.status != "ongoing") {
        return ctx.badRequest("Election is not ongoing");
      }

      if (!ip) {
        return ctx.badRequest("Invalid or Missing IP");
      }

      if (!location || !candidateId || !secretPin) {
        return ctx.badRequest("Please provide your location and pin");
      }

      console.log("Req Data")
      console.log(candidateId)
      console.log(secretPin)
      console.log(location)
      console.log(ip)

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

      console.log("Candidate")
      console.log(candidate[0])

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

      console.log("Volunteer")
      console.log(volunteer[0])

      if (!volunteer[0]?.canVote) {
        return ctx.badRequest("You are currently unable to cast a vote");
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
                $or: [
                  {
                    ip: ip,
                  },
                  {
                    location: location,
                  },
                ],
              },
            ],
          },
        }
      );

      if (existingVote.length) {
        return ctx.badRequest("You have already voted");
      }

      console.log("Existing Vote")
      console.log(existingVote)

      const salt = 4;
      const token = bcrypt.hashSync(secretPin, salt);
      console.log("Token")
      console.log(token)
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
              totalVotes: election?.totalVotes + 1,
            },
          }
        );
        console.log("Result")
        console.log(result)
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
        fields: ["token", "candidate", "location", "ip"],
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
              fields: ["id", "name", "email", "avatar"],
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
