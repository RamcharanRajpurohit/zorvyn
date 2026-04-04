import { InferSchemaType, Model, Schema, model, models } from 'mongoose'

const authSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    replacedBySession: {
      type: Schema.Types.ObjectId,
      ref: 'AuthSession',
      default: null,
    },
    userAgent: {
      type: String,
      default: '',
      maxlength: 500,
    },
    ipAddress: {
      type: String,
      default: '',
      maxlength: 100,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
    lastUsedIp: {
      type: String,
      default: '',
      maxlength: 100,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
authSessionSchema.index({ user: 1, revokedAt: 1, expiresAt: -1 })

export type AuthSessionDocument = InferSchemaType<typeof authSessionSchema> & {
  _id: Schema.Types.ObjectId
}

export const AuthSessionModel: Model<AuthSessionDocument> =
  (models.AuthSession as Model<AuthSessionDocument> | undefined) ||
  model<AuthSessionDocument>('AuthSession', authSessionSchema)
