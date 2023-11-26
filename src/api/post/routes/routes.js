module.exports = {
  routes: [
    {
      method: "POST",
      path: "/posts/create",
      handler: "post.createNewPost",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/posts/view/all",
      handler: "post.getAllPosts",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/post/like/:id",
      handler: "post.likePost",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/post/unlike/:id",
      handler: "post.unlikePost",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
