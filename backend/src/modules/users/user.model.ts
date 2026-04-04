import { InferSchemaType, Model, Schema, model, models } from 'mongoose'
import { USER_ROLES, USER_STATUSES } from '../../constants/roles'

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'viewer',
      required: true,
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: 'active',
      required: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

userSchema.index({ role: 1, status: 1 })

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId }

export const UserModel: Model<UserDocument> =
  (models.User as Model<UserDocument> | undefined) || model<UserDocument>('User', userSchema)
