module.exports = {
    routes: [
        {
            method: 'POST',
            path: '/sessions/questions/:sessionId',
            handler: 'question.ask',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/sessions/questions/:sessionId',
            handler: 'question.view',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'PUT',
            path: '/sessions/questions/update/:id',
            handler: 'question.updateQuestion',
            config: {
                policies: [],
                middlewares: [],
            },
        }
    ]
}