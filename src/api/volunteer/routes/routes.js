module.exports={
    routes: [
        {
            method: 'POST',
            path: '/volunteers/view/all',
            handler: 'volunteer.fetchVolunteers',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}