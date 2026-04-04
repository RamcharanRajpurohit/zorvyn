import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { validateRequest } from '../../middleware/validate-request'
import { authorize } from '../../middleware/authorize'
import * as userController from './user.controller'
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  userQuerySchema,
} from './user.schema'

const router = Router()

router.get(
  '/',
  authorize('admin'),
  validateRequest({ query: userQuerySchema }),
  asyncHandler(userController.listUsers)
)

router.post(
  '/',
  authorize('admin'),
  validateRequest({ body: createUserSchema }),
  asyncHandler(userController.createUser)
)

router.get(
  '/:id',
  authorize('admin'),
  validateRequest({ params: userIdParamSchema }),
  asyncHandler(userController.getUserById)
)

router.patch(
  '/:id',
  authorize('admin'),
  validateRequest({ params: userIdParamSchema, body: updateUserSchema }),
  asyncHandler(userController.updateUser)
)

export default router
