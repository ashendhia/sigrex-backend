const organizationRouter = require('express').Router()
const { request, response } = require('express')
const { userExtractor } = require('../utils/middleware')
const bcrypt = require('bcrypt')
const { prisma } = require('../index.js'); // Adjust the path as needed

organizationRouter.post('/', async (request, response) => {
    const { mail, name, photo, password, phone, address, more } = request.body;

    const existingUser = await prisma.baseUser.findUnique({
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

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    try {
        const user = await prisma.baseUser.create({
            data: {
                mail,
                name,
                photo,
                passwordHash,
                phone,
                address,
                more,
                organization: {
                    create: {
                        participants: {
                            create: []
                        }
                    }
                }
            }
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

// set the organization to approved but only if the user is an admin
organizationRouter.put('/:id', userExtractor, async (req, res) => {
    const user = req.user;

    if (user.email !== 'admin@esi.dz') {
        return res.status(401).json({
            error: 'invalid user'
        });
    }

    const { id, approved } = req.params;

    try {
        const organization = await prisma.organization.update({
            where: {
                id: parseInt(id)
            },
            data: {
                approved: approved
            }
        });

        res.status(200).json(organization);
    } catch (error) {
        res.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = organizationRouter