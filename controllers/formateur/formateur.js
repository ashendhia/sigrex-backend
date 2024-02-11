const formateurRouter = require('express').Router();
const { adminExtractor } = require('../../utils/middleware.js');
const bcrypt = require('bcrypt');
const { prisma } = require('../../index.js'); // Adjust the path as needed

formateurRouter.post('/', async (request, response) => {
    const { mail, name, photo, password, phone, address, more, familyName, sexe, diploma, employeur, fonction, cv, numeroCompte, status, salaire } = request.body;

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

    const diplomaDB = await prisma.diploma.findUnique({
        where: {
            designation: diploma
        }
    });

    if (!diplomaDB) {
        return response.status(400).json({
            error: 'diploma not found'
        })
    }



    try {
        const profile = await prisma.profile.create({
            data: {
                mail,
                name,
                photo,
                password: passwordHash,
                phone,
                address,
                more,
                user: {
                    create: {
                        familyName,
                        sexe,
                        formateur: {
                            create: {
                                diplomaId: diplomaDB.id,
                                employeur,
                                fonction,
                                cv,
                                numeroCompte,
                                status,
                                salaire,
                            }
                        }
                    }
                }
            }
        });

        response.status(201).json(profile);
    } catch (error) {
        response.status(500).json(error);
    }
});

formateurRouter.put('/:id', adminExtractor, async (request, response) => {
    const { id, approved } = request.params;

    try {
        const formateur = await prisma.formateur.update({
            where: {
                id: parseInt(id)
            },
            data: {
                approved: approved
            }
        });

        response.status(200).json(formateur);
    } catch (error) {
        response.status(500).json({ error: 'Something went wrong' });
    }
})

module.exports = formateurRouter;