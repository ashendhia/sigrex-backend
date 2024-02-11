const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const organizationRouter = require('./controllers/organization')
const formateurRouter = require('./controllers/formateur/formateur')
// Formateur Related
const diplomeRouter = require('./controllers/formateur/diplome')
// Formation Related
const formationRouter = require('./controllers/formations/formation')
const domaineRouter = require('./controllers/formations/domaine')
const themeRouter = require('./controllers/formations/theme')
const niveauRouter = require('./controllers/formations/niveau')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

logger.info('Connecting to planetscale database...')



app.use(cors())

app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/organization', organizationRouter)
app.use('/api/formateur', formateurRouter)
// Formateur Related
app.use('/api/diplome', diplomeRouter)
// Formation Related
app.use('/api/formation', formationRouter)
app.use('/api/domaine', domaineRouter)
app.use('/api/theme', themeRouter)
app.use('/api/niveau', niveauRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app