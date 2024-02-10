const formateurRouter = require('express').Router();
const { request, response } = require('express');
const { userExtractor } = require('../utils/middleware');
const bcrypt = require('bcrypt');
const { prisma } = require('../index.js'); // Adjust the path as needed

formateurRouter.post('/', async (request, response) => {
    const { mail, name, photo, password, phone, address, more, familyName, sexe, diploma, specialty, employeur, fonction, cv, numeroCompte, status, salaire } = request.body;

    const existingUser = await prisma.user.findUnique({
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
        const baseUser = await prisma.baseUser.create({
            data: {
                mail,
                name,
                photo,
                passwordHash,
                phone,
                address,
                more,
                approved,
                user: {
                    create: {
                        familyName,
                        sexe,
                        formateur: {
                            create: {
                                diploma,
                                specialty,
                                employeur,
                                fonction,
                                cv,
                                numeroCompte,
                                status,
                                salaire,
                                formations: {
                                    create: formations
                                }
                            }
                        }
                    }
                }
            }
        });

        response.status(201).json(baseUser);
    } catch (error) {
        response.status(500).json({ error: 'Something went wrong' });
    }
});