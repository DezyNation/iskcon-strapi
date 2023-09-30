module.exports={
    routes: [
        {
            method: 'GET',
            path: '/candidates/view/all',
            handler: 'candidate.getAllCandidates',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}