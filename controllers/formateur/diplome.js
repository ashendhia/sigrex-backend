const diplomeRouter = require('express').Router();
const { request, response } = require('express');
const { adminExtractor } = require('../../utils/middleware.js');
const { prisma } = require('../../index.js');

diplomeRouter.post('/', adminExtractor, async (request, response) => {

    const { designation } = request.body;

    try {
        const diplome = await prisma.diploma.create({
            data: {
                designation
            }
        });

        response.status(201).json(diplome);
    } catch (error) {
        if (error.code === 'P2002') {
            response.status(400).json({ error: 'A diplome with this designation already exists.' });
        } else {
            response.status(500).json({ error: 'Something went wrong' });
        }
    }
})

diplomeRouter.get('/', async (request, response) => {
    const diplomes = await prisma.diploma.findMany();
    response.json(diplomes);
});

module.exports = diplomeRouter;