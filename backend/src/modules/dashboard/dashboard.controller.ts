import { Request, Response } from 'express'
import { successResponse } from '../../utils/api-response'
import * as dashboardService from './dashboard.service'

export async function getOverview(req: Request, res: Response) {
  const data = await dashboardService.getOverview(req.query as never)
  res.json(successResponse(data, 'Dashboard overview fetched successfully'))
}
