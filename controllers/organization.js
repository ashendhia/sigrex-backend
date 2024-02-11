const organizationRouter = require('express').Router()
const { adminExtractor } = require('../utils/middleware')
const bcrypt = require('bcrypt')
const { prisma } = require('../index.js'); // Adjust the path as needed

organizationRouter.post('/', async (request, response) => {
    const { mail, name, photo, password, phone, address, more, pays, url, fax } = request.body;

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

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    try {
        const user = await prisma.profile.create({
            data: {
                mail,
                name,
                photo,
                password: passwordHash,
                phone,
                address,
                more,
                organization: {
                    create: {
                        pays,
                        url,
                        fax,
                        participants: {
                            create: []
                        }
                    }
                }
            }
        });

        response.status(201).json(user);
    } catch (error) {
        response.status(500).json({ error: 'Something went wrong' });
    }
});

// set the organization to approved but only if the user is an admin
organizationRouter.put('/:id', adminExtractor, async (req, response) => {

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

        response.status(200).json(organization);
    } catch (error) {
        response.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = organizationRouter