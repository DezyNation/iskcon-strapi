module.exports={
    routes: [
        {
            method: 'POST',
            path: '/volunteers/create/new',
            handler: 'volunteer.createNewVolunteer',
            config: {
                policies: [],
                middlewares: [],
            },
        },
    ]
}