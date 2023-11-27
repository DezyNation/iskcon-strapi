"use strict";

/**
 * post controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::post.post", ({ strapi }) => ({
  createNewPost: async (ctx, next) => {
    try {
      const { user } = ctx.state;
      const { description } = ctx?.request?.body;

      const result = await strapi.entityService.create("api::post.post", {
        data: {
          description: description,
          creator: {
            connect: [user?.id],
          },
        },
      });
      ctx.body = { ...result, collection: "api::post.post" };
    } catch (error) {
      console.log("Error while creating new post ");
      console.log(error);
      ctx.response.body = error;
    }
  },
  getAllPosts: async (ctx, next) => {
    try {
      const result = await strapi.entityService.findMany("api::post.post", {
        fields: ["description", "createdAt"],
        populate: {
          creator: {
            fields: ["id", "name", "username"],
            populate: {
              avatar: {
                fields: ["url"],
              },
            },
          },
          reactions: {
            fields: ["id", "name", "username"],
            populate: {
              avatar: {
                fields: ["url"],
              },
            },
          },
        },
        sort: {
          createdAt: "desc",
        },
      });
      ctx.body = result;
    } catch (error) {
      console.log("Error while creating new post ");
      console.log(error);
      ctx.response.body = error;
    }
  },
  likePost: async (ctx) => {
    try {
      const { id } = ctx.params;
      const { user } = ctx.state;

      if (!user) {
        ctx.unauthorized("Please login to like this post");
        return;
      }

      const like = await strapi.entityService.update(
        "api::post.post",
        parseInt(id),
        {
          data: {
            reactions: {
              connect: [user?.id],
            },
          },
        }
      );

      ctx.body = like;
    } catch (error) {
      ctx.internalServerError = error;
    }
  },
  unlikePost: async (ctx) => {
    try {
      const { id } = ctx.params;
      const { user } = ctx.state;

      if (!user) {
        ctx.unauthorized("Please login to like this post");
        return;
      }

      const like = await strapi.entityService.update(
        "api::post.post",
        parseInt(id),
        {
          data: {
            reactions: {
              disconnect: [user?.id],
            },
          },
        }
      );

      ctx.body = like;
    } catch (error) {
      ctx.internalServerError = error;
    }
  },
}));
