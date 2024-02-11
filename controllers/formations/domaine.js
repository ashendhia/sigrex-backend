const domaineRouter = require('express').Router();
const { adminExtractor } = require('../../utils/middleware.js');
const { prisma } = require('../../index.js');

domaineRouter.post('/', adminExtractor, async (request, response) => {

    const { designation } = request.body;

    try {
        const domaine = await prisma.domaine.create({
            data: {
                designation
            }
        });

        response.status(201).json(domaine);
    } catch (error) {
        if (error.code === 'P2002') {
            response.status(400).json({ error: 'A domaine with this designation already exists.' });
        } else {
            response.status(500).json({ error: 'Something went wrong' });
        }
    }
})

domaineRouter.get('/', async (request, response) => {
    const domaines = await prisma.domaine.findMany();
    response.json(domaines);
});

module.exports = domaineRouter;