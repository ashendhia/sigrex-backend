const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const { prisma } = require('../index'); // Adjust the path as needed

loginRouter.post('/', async (request, response) => {
    const { mail, password } = request.body

    const user = await prisma.profile.findUnique({
        where: {
            mail: mail
        },
        include: {
            user: true,
            organization: true,
        }
    })

    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.password)

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password'
        })
    }

    if (!user.approved) {
        return response.status(401).json({
            error: 'account not approved'
        })
    }

    console.log(user);


    const userWithoutPass = {
        mail: user.mail,
        phone: user.phone,
    }

    const userForToken = {
        id: user.id,
        mail: user.mail,
        moderation: user.moderation,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    response
        .status(200)
        .send({ token, userid: user.id, userWithoutPass })
})

module.exports = loginRouter