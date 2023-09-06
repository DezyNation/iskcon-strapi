module.exports={
    routes: [
        {
            method: 'GET',
            path: '/iskconinc/:role',
            handler: 'temple.getUsers',
            config: {
                policies: [],
                middlewares: [],
            },
        }
    ]
}