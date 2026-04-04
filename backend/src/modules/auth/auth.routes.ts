import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { validateRequest } from '../../middleware/validate-request'
import { authenticate } from '../../middleware/authenticate'
import * as authController from './auth.controller'
import { bootstrapAdminSchema, loginSchema, refreshSessionSchema } from './auth.schema'

const router = Router()

router.post(
  '/bootstrap-admin',
  validateRequest({ body: bootstrapAdminSchema }),
  asyncHandler(authController.bootstrapAdmin)
)

router.post(
  '/login',
  validateRequest({ body: loginSchema }),
  asyncHandler(authController.login)
)

router.post(
  '/refresh',
  validateRequest({ body: refreshSessionSchema }),
  asyncHandler(authController.refresh)
)

router.post(
  '/logout',
  validateRequest({ body: refreshSessionSchema }),
  asyncHandler(authController.logout)
)

router.get('/me', authenticate, asyncHandler(authController.me))

export default router
