module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/posts/create',
            handler: 'post.createNewPost',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/posts/view/all',
            handler: 'post.getAllPosts',
            config: {
                policies: [],
                middlewares: [],
            },
        }
    ]
}