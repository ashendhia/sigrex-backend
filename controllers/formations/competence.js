const competenceRouter = require('express').Router();
const { adminExtractor } = require('../../utils/middleware.js');
const { prisma } = require('../../index.js');

competenceRouter.post('/', adminExtractor, async (request, response) => {

    const { theme, designation } = request.body;

    const themeDB = await prisma.theme.findUnique({
        where: {
            designation: theme
        }
    })

    try {
        const competence = await prisma.competence.create({
            data: {
                themeId: themeDB.id,
                designation
            },
            include: {
                formations: true
            }
        });

        response.status(201).json(competence);
    } catch (error) {
        if (error.code === 'P2002') {
            response.status(400).json({ error: 'A competence with this designation already exists.' });
        } else {
            response.status(500).json({ error: 'Something went wrong' });
        }
    }
})

competenceRouter.get('/', async (request, response) => {
    const competences = await prisma.competence.findMany();
    response.json(competences);
});

module.exports = competenceRouter;

