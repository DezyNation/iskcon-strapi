module.exports={
    routes: [
        {
            method: 'GET',
            path: '/volunteers/view/all',
            handler: 'volunteer.fetchVolunteers',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}