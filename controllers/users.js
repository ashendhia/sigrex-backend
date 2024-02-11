const usersRouter = require('express').Router()
const { userExtractor } = require('../utils/middleware')
const bcrypt = require('bcrypt')
const { prisma } = require('../index.js'); // Adjust the path as needed

usersRouter.post('/', async (request, response) => {
    const { mail, name, password, secret, phone, address, more } = request.body

    const existingUser = await prisma.profile.findUnique({
        where: {
            mail: mail
        }
    })
    if (existingUser) {
        return response.status(400).json({
            error: 'Un seul compte par adresse email'
        })
    }
    else if (password.length < 3) {
        return response.status(400).json({
            error: 'password less than 3 characters'
        })
    }

    else if (secret !== process.env.SECRET) {
        return response.status(401).json({
            error: 'invalid secret'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = {
        mail: mail,
        name: name,
        password: passwordHash,
        moderation: true,
        phone: phone,
        address: address,
        more: more,
        approved: true,
    }

    const savedUser = await prisma.profile.create({
        data: user
    })

    response.status(201).json(savedUser)
})


usersRouter.get('/', userExtractor, async (request, response) => {

    const user = request.user

    if (user.email !== 'admin@esi.dz') {
        return response.status(401).json({
            error: 'invalid user'
        })
    }

    const users = await prisma.user.findMany()

    // select only the users that have candidatures that were done this year 
    const usersWithCandidatures = users.filter(user => {
        return user.candidatures.some(candidature => {
            return candidature.createdAt.getFullYear() === new Date().getFullYear()
        })
    })

    // select only the users that have candidatures that are not yet treated

    const finalResult = usersWithCandidatures.filter(user => {
        return user.candidatures.some(candidature => {
            return candidature.status === null
        })
    })

    response
        .status(200)
        .send(finalResult)
})

module.exports = usersRouter