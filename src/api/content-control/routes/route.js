module.exports = {
    routes: [
      {
        method: "PUT",
        path: "/cowcare-data",
        handler: "content-control.updateData",
        config: {
          policies: [],
          middlewares: [],
        },
      },
    ]
}