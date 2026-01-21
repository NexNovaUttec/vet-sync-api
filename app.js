import express from 'express'
import morgan from 'morgan'
import { corsMiddleware } from '#middlewares/cors.js'
import { rateLimiter } from '#middlewares/rateLimit.js'
import { router } from '#routes/index.js'
import { port, logger } from '#root/config.js'
import { initDatabaseConnection } from '#databases/index.js'

const app = express()

app.use(express.json())
app.disable('x-powered-by')
app.use(morgan(logger))
app.use(corsMiddleware())
app.use(rateLimiter)

app.use(router)

app.listen(port, async () => {
  await initDatabaseConnection()
  console.log(`\nServer running on port ${port}\n`)
})
