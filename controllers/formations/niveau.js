const niveauRouter = require('express').Router();
const { adminExtractor } = require('../../utils/middleware.js');
const { prisma } = require('../../index.js');

niveauRouter.post('/', adminExtractor, async (request, response) => {

    const { designation } = request.body;

    try {
        const niveau = await prisma.niveau.create({
            data: {
                designation
            }
        });

        response.status(201).json(niveau);
    } catch (error) {
        if (error.code === 'P2002') {
            response.status(400).json({ error: 'A niveau with this designation already exists.' });
        } else {
            console.log(error);
            response.status(500).json({ error: 'Something went wrong' });
        }
    }
});

niveauRouter.get('/', async (request, response) => {
    const niveaux = await prisma.niveau.findMany();
    response.json(niveaux);
});

module.exports = niveauRouter;