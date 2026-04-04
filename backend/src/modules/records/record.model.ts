import { InferSchemaType, Model, Schema, model, models } from 'mongoose'

const recordSchema = new Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    occurredAt: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

recordSchema.index({ isDeleted: 1, occurredAt: -1 })
recordSchema.index({ type: 1, category: 1, occurredAt: -1 })
recordSchema.index({ createdBy: 1, occurredAt: -1 })

export type RecordDocument = InferSchemaType<typeof recordSchema> & { _id: Schema.Types.ObjectId }

export const RecordModel: Model<RecordDocument> =
  (models.Record as Model<RecordDocument> | undefined) || model<RecordDocument>('Record', recordSchema)
