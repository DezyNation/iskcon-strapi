module.exports ={
    routes: [
        {
            method: 'POST',
            path: '/vote/caste-vote',
            handler: 'vote.casteVote',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}