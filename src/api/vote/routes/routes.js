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
        {
            method: 'GET',
            path: '/vote/valid-votes',
            handler: 'vote.getValidVotes',
            config: {
                policies: [],
                middlewares: [],
            },
        },
        {
            method: 'GET',
            path: '/vote/result',
            handler: 'vote.result',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}