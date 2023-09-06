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
        },
        {
            method: 'GET',
            path: '/sessions/info/:slug',
            handler: 'session.getSessionInfo',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/sessions/upcoming-sessions',
            handler: 'session.getUpcomingSessions',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/sessions/ongoing-sessions',
            handler: 'session.getOngoingSessions',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}