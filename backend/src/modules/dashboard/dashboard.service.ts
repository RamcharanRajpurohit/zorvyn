import { PipelineStage } from 'mongoose'
import { RecordModel } from '../records/record.model'

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function endOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(23, 59, 59, 999)
  return next
}

export async function getOverview(query: {
  from?: Date
  to?: Date
  recentLimit: number
  trend: 'hourly' | 'daily' | 'weekly' | 'monthly'
}) {
  const now = new Date()
  const defaultFrom = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const rangeFilter = {
    occurredAt: {
      $gte: startOfDay(query.from ?? defaultFrom),
      $lte: endOfDay(query.to ?? now),
    },
  }

  const groupId =
    query.trend === 'hourly'
      ? {
          year: { $year: '$occurredAt' },
          month: { $month: '$occurredAt' },
          day: { $dayOfMonth: '$occurredAt' },
          hour: { $hour: '$occurredAt' },
        }
      : query.trend === 'daily'
      ? {
          year: { $year: '$occurredAt' },
          month: { $month: '$occurredAt' },
          day: { $dayOfMonth: '$occurredAt' },
        }
      : query.trend === 'weekly'
      ? {
          year: { $isoWeekYear: '$occurredAt' },
          week: { $isoWeek: '$occurredAt' },
        }
      : {
          year: { $year: '$occurredAt' },
          month: { $month: '$occurredAt' },
        }

  const trendProjection =
    query.trend === 'hourly'
      ? {
          label: {
            $dateToString: { format: '%Y-%m-%dT%H:00:00', date: '$firstDate' },
          },
        }
      : query.trend === 'daily'
      ? {
          label: {
            $dateToString: { format: '%Y-%m-%d', date: '$firstDate' },
          },
        }
      : query.trend === 'weekly'
      ? {
          label: {
            $concat: [
              { $toString: '$_id.year' },
              '-W',
              { $toString: '$_id.week' },
            ],
          },
        }
      : {
          label: {
            $dateToString: { format: '%Y-%m', date: '$firstDate' },
          },
        }

  const baseMatch: PipelineStage.Match['$match'] = {
    isDeleted: false,
    ...rangeFilter,
  }

  const [totals, categories, trends, recentActivity] = await Promise.all([
    RecordModel.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]),
    RecordModel.aggregate([
      { $match: { ...baseMatch, type: 'expense' } },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]),
    RecordModel.aggregate([
      { $match: baseMatch },
      {
        $group: {
          _id: groupId,
          income: {
            $sum: {
              $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0],
            },
          },
          recordCount: { $sum: 1 },
          firstDate: { $min: '$occurredAt' },
        },
      },
      { $sort: { firstDate: 1 } },
      {
        $project: {
          _id: 0,
          income: 1,
          expense: 1,
          recordCount: 1,
          netBalance: { $subtract: ['$income', '$expense'] },
          ...trendProjection,
        },
      },
    ]),
    RecordModel.find(baseMatch)
      .sort({ occurredAt: -1, createdAt: -1 })
      .limit(query.recentLimit)
      .populate('createdBy', 'name email role')
      .lean(),
  ])

  const totalIncome = totals.find((item) => item._id === 'income')?.totalAmount ?? 0
  const totalExpenses = totals.find((item) => item._id === 'expense')?.totalAmount ?? 0
  const totalRecords = totals.reduce((sum, item) => sum + item.count, 0)

  const mappedRecentActivity = recentActivity.map((item) => {
    const createdBy =
      item.createdBy && typeof item.createdBy === 'object' && '_id' in item.createdBy
        ? {
            id: item.createdBy._id.toString(),
            name: 'name' in item.createdBy ? item.createdBy.name : undefined,
            email: 'email' in item.createdBy ? item.createdBy.email : undefined,
            role: 'role' in item.createdBy ? item.createdBy.role : undefined,
          }
        : null

    return {
      id: item._id.toString(),
      amount: item.amount,
      type: item.type,
      category: item.category,
      occurredAt: item.occurredAt,
      notes: item.notes ?? '',
      createdBy,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  })

  return {
    filters: {
      from: rangeFilter.occurredAt.$gte,
      to: rangeFilter.occurredAt.$lte,
      trend: query.trend,
    },
    totals: {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalRecords,
    },
    categoryTotals: categories.map((item) => ({
      category: item._id,
      totalAmount: item.totalAmount,
      count: item.count,
    })),
    trends,
    recentActivity: mappedRecentActivity,
  }
}
