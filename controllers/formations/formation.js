const formationRouter = require('express').Router();
const { adminExtractor } = require('../../utils/middleware.js')
const { prisma } = require('../../index.js');

formationRouter.post('/', adminExtractor, async (request, response) => {
    const { type, designation, description, photo, themeId, dateDebut, dateFin, dureeH, dureeJ, heuresParJour, tarif, niveauId, ressourcesMaterielles, ressourcesLogicielles, certificate, prerequis, objectifs, lieu, status, nbParticipants, nbGroupes } = request.body;

    try {
        const formation = await prisma.formation.create({
            data: {
                type,
                designation,
                description,
                photo,
                themeId,
                dateDebut: new Date(dateDebut),
                dateFin: new Date(dateFin),
                dureeH,
                dureeJ,
                heuresParJour,
                tarif,
                niveauId,
                ressourcesMaterielles,
                ressourcesLogicielles,
                certificate,
                prerequis,
                objectifs,
                lieu,
                status,
                nbParticipants,
                nbGroupes
            }
        });

        response.status(201).json(formation);
    } catch (error) {
        console.log(error);
        response.status(500).json({ error: 'Something went wrong' });
    }
});

formationRouter.get('/', async (request, response) => {
    const { domaines, themes, niveaux, page } = request.query;

    try {

        // verify if the theme in formation is any of the themes in the query, and if the theme is in the query, verify if the domaine is in the query

        const formations = await prisma.formation.findMany({
            include: {
                theme: {
                    include: {
                        domaine: true
                    }
                },
                niveau: true,
                prerequis: true
            },
            where: {
                themeId: {
                    in: themes ? themes : []
                },
                domaineId: {
                    in: domaines ? domaines : []
                },
                niveauId: {
                    in: niveaux ? niveaux : []
                }
            },
            skip: Number(page) * 12,
            take: 12
        })

        response.status(200).json(formations);
    }
    catch (error) {
        console.log(error);
        response.status(500).json(error);
    }
})

formationRouter.get('/:id', async (request, response) => {
    const { id } = request.params;

    try {
        const formation = await prisma.formation.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                theme: {
                    include: {
                        domaine: true
                    }
                },
                competences: {
                    include: {
                        competence: true
                    }
                }
            }
        });

        response.status(200).json(formation);
    } catch (error) {
        response.status(500).json({ error: 'Something went wrong' });
    }
});

module.exports = formationRouter;





