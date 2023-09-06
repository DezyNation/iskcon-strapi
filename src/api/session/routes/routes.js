module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/sessions/create',
            handler: 'session.createNewSession',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/sessions/view/all',
            handler: 'session.getAllSessions',
            config: {
                policies: [],
                middlewares: [],
            },
        }
    ]
}