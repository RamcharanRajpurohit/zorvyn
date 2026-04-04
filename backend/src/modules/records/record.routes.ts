import { Router } from 'express'
import { asyncHandler } from '../../utils/async-handler'
import { authorize } from '../../middleware/authorize'
import { validateRequest } from '../../middleware/validate-request'
import * as recordController from './record.controller'
import {
  createRecordSchema,
  listRecordQuerySchema,
  recordIdParamSchema,
  updateRecordSchema,
} from './record.schema'

const router = Router()

router.get(
  '/',
  authorize('admin', 'analyst'),
  validateRequest({ query: listRecordQuerySchema }),
  asyncHandler(recordController.listRecords)
)

router.post(
  '/',
  authorize('admin'),
  validateRequest({ body: createRecordSchema }),
  asyncHandler(recordController.createRecord)
)

router.get(
  '/:id',
  authorize('admin', 'analyst'),
  validateRequest({ params: recordIdParamSchema }),
  asyncHandler(recordController.getRecordById)
)

router.patch(
  '/:id',
  authorize('admin'),
  validateRequest({ params: recordIdParamSchema, body: updateRecordSchema }),
  asyncHandler(recordController.updateRecord)
)

router.delete(
  '/:id',
  authorize('admin'),
  validateRequest({ params: recordIdParamSchema }),
  asyncHandler(recordController.deleteRecord)
)

export default router
