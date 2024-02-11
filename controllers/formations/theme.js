const themeRouter = require('express').Router();
const { adminExtractor } = require('../../utils/middleware.js');
const { prisma } = require('../../index.js');

themeRouter.post('/', adminExtractor, async (request, response) => {

    const { domaine, designation, description, public } = request.body;

    let domaineDB = await prisma.domaine.findUnique({
        where: {
            designation: domaine
        }
    });

    if (!domaineDB) {
        response.status(400).json({ error: 'Domaine not found' });
    }

    try {
        const theme = await prisma.theme.create({
            data: {
                domaineId: domaineDB.id,
                designation,
                description,
                public
            }
        });

        response.status(201).json(theme);
    } catch (error) {
        if (error.code === 'P2002') {
            response.status(400).json({ error: 'A theme with this designation already exists.' });
        } else {
            response.status(500).json({ error: 'Something went wrong' });
        }
    }
});

themeRouter.get('/', async (request, response) => {
    const themes = await prisma.theme.findMany();
    response.json(themes);
});

module.exports = themeRouter;