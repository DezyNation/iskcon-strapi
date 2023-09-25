module.exports = {
    routes: [
        {
            method: 'GET',
            path: '/session-participant/all',
            handler: 'session-participant.allParticipants',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/session-participant/add-me',
            handler: 'session-participant.addMe',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/session-participant/remove-me',
            handler: 'session-participant.removeMe',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'POST',
            path: '/session-participant/notify',
            handler: 'session-participant.notify',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}