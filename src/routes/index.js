import { Router } from 'express'
import { authenticateToken } from '#middlewares/auth.js'
import { validateApiKey } from '#middlewares/apiKey.js'
import { userRouter } from '#routes/userRouter.js'
import { authRouter } from '#routes/authRouter.js'
import { petRouter } from '#routes/petRouter.js'
import { speciesRouter } from '#routes/speciesRouter.js'
import { breedsRouter } from '#routes/breedsRouter.js'
import { vetRouter } from '#routes/vetRouter.js'
import { scheduleRouter } from '#routes/scheduleRouter.js'
import { servicesRouter } from '#routes/servicesRouter.js'
import { categoriesRouter } from '#routes/categoriesRouter.js'
import { appointmentsRouter } from '#routes/appointmentsRouter.js'

export const router = Router()

router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the vet-sync API',
    github: 'https://github.com/omancillav/vet-sync-api.git',
    author: 'omancillav'
  })
})

router.use(validateApiKey)

router.use('/users', userRouter)
router.use('/auth', authRouter)
router.use('/services', servicesRouter)

router.use(authenticateToken)

router.use('/species', speciesRouter)
router.use('/breeds', breedsRouter)
router.use('/pets', petRouter)
router.use('/vets', vetRouter)
router.use('/schedules', scheduleRouter)
router.use('/categories', categoriesRouter)
router.use('/appointments', appointmentsRouter)
