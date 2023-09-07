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
        {
            method: 'POST',
            path: '/sessions/start-session',
            handler: 'session.startSession',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/sessions/stop-session',
            handler: 'session.stopSession',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'PUT',
            path: '/sessions/update-session',
            handler: 'session.updateSessionData',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}