const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const adminRouter = require('express').Router()
const { prisma } = require('../index'); // Adjust the path as needed

adminRouter.post('/', async (request, response) => {
    const { mail, password } = request.body

    const user = await prisma.profile.findUnique({
        where: {
            mail: mail
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

    if (!user.moderation) {
        return response.status(401).json({
            error: 'account not approved'
        })
    }

    const userWithoutPass = {
        mail: user.mail,
        phone: user.phone,
        moderation: user.moderation,
    }

    const userForToken = {
        id: user.id,
        mail: user.mail,
        moderation: user.moderation,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    response
        .status(200)
        .send({ token, userWithoutPass })
})

module.exports = adminRouter