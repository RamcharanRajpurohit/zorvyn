import { Request, Response } from 'express'
import { successResponse } from '../../utils/api-response'
import * as recordService from './record.service'

export async function createRecord(req: Request, res: Response) {
  const record = await recordService.createRecord(req.body, req.user!.id)
  res.status(201).json(successResponse(record, 'Record created successfully'))
}

export async function listRecords(req: Request, res: Response) {
  const records = await recordService.listRecords(req.query as never)
  res.json(successResponse(records, 'Records fetched successfully'))
}

export async function getRecordById(req: Request, res: Response) {
  const record = await recordService.getRecordById(req.params.id as string)
  res.json(successResponse(record, 'Record fetched successfully'))
}

export async function updateRecord(req: Request, res: Response) {
  const record = await recordService.updateRecord(req.params.id as string, req.body, req.user!.id)
  res.json(successResponse(record, 'Record updated successfully'))
}

export async function deleteRecord(req: Request, res: Response) {
  const result = await recordService.deleteRecord(req.params.id as string, req.user!.id)
  res.json(successResponse(result, 'Record deleted successfully'))
}
