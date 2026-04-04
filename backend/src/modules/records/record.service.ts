import mongoose from 'mongoose'
import { ApiError } from '../../utils/api-error'
import { RecordModel } from './record.model'

function ensureObjectId(id: string, entityName: string) {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(400, `Invalid ${entityName} id`)
  }
}

type RecordActor = {
  _id?: { toString(): string }
  name?: string
  email?: string
}

type RecordMapperInput = {
  _id: { toString(): string }
  amount: number
  type: 'income' | 'expense'
  category: string
  occurredAt: Date
  notes?: string
  createdBy: { toString(): string } | RecordActor
  updatedBy: { toString(): string } | RecordActor
  createdAt: Date
  updatedAt: Date
}

function mapActor(actor: { toString(): string } | RecordActor) {
  if (typeof actor === 'object' && actor !== null && '_id' in actor && actor._id) {
    return {
      id: actor._id.toString(),
      name: actor.name,
      email: actor.email,
    }
  }

  return { id: actor.toString() }
}

function mapRecord(record: RecordMapperInput) {
  return {
    id: record._id.toString(),
    amount: record.amount,
    type: record.type,
    category: record.category,
    occurredAt: record.occurredAt,
    notes: record.notes ?? '',
    createdBy: mapActor(record.createdBy),
    updatedBy: mapActor(record.updatedBy),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export async function createRecord(
  payload: {
    amount: number
    type: 'income' | 'expense'
    category: string
    occurredAt: Date
    notes?: string
  },
  actorId: string
) {
  ensureObjectId(actorId, 'user')

  const record = await RecordModel.create({
    ...payload,
    createdBy: actorId,
    updatedBy: actorId,
  })

  return mapRecord(record as unknown as RecordMapperInput)
}

export async function listRecords(query: {
  page: number
  limit: number
  type?: 'income' | 'expense'
  category?: string
  from?: Date
  to?: Date
  search?: string
  sortBy: 'occurredAt' | 'amount' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}) {
  const filter: Record<string, unknown> = { isDeleted: false }

  if (query.type) filter.type = query.type
  if (query.category) filter.category = query.category
  if (query.search) filter.notes = { $regex: query.search, $options: 'i' }
  if (query.from || query.to) {
    filter.occurredAt = {
      ...(query.from ? { $gte: query.from } : {}),
      ...(query.to ? { $lte: query.to } : {}),
    }
  }

  const sortDirection = query.sortOrder === 'asc' ? 1 : -1
  const skip = (query.page - 1) * query.limit

  const [items, total] = await Promise.all([
    RecordModel.find(filter)
      .sort({ [query.sortBy]: sortDirection })
      .skip(skip)
      .limit(query.limit)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .lean(),
    RecordModel.countDocuments(filter),
  ])

  return {
    items: items.map((item) => mapRecord(item as unknown as RecordMapperInput)),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getRecordById(id: string) {
  ensureObjectId(id, 'record')

  const record = await RecordModel.findOne({ _id: id, isDeleted: false })
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .lean()

  if (!record) {
    throw new ApiError(404, 'Record not found')
  }

  return mapRecord(record as unknown as RecordMapperInput)
}

export async function updateRecord(
  id: string,
  payload: {
    amount?: number
    type?: 'income' | 'expense'
    category?: string
    occurredAt?: Date
    notes?: string
  },
  actorId: string
) {
  ensureObjectId(id, 'record')
  ensureObjectId(actorId, 'user')

  const record = await RecordModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      ...payload,
      updatedBy: actorId,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate('createdBy', 'name email')
    .populate('updatedBy', 'name email')
    .lean()

  if (!record) {
    throw new ApiError(404, 'Record not found')
  }

  return mapRecord(record as unknown as RecordMapperInput)
}

export async function deleteRecord(id: string, actorId: string) {
  ensureObjectId(id, 'record')
  ensureObjectId(actorId, 'user')

  const record = await RecordModel.findOneAndUpdate(
    { _id: id, isDeleted: false },
    {
      isDeleted: true,
      updatedBy: actorId,
    },
    { new: true }
  )

  if (!record) {
    throw new ApiError(404, 'Record not found')
  }

  return {
    id: record._id.toString(),
    deleted: true,
  }
}
