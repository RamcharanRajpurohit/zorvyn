import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { authorize } from '../../middleware/authorize'
import { validateRequest } from '../../middleware/validate-request'
import * as dashboardController from './dashboard.controller'
import { dashboardQuerySchema } from './dashboard.schema'

const router = Router()

router.get(
  '/overview',
  authorize('viewer', 'analyst', 'admin'),
  validateRequest({ query: dashboardQuerySchema }),
  asyncHandler(dashboardController.getOverview)
)

export default router
