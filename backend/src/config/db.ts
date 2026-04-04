import mongoose from 'mongoose'
import { env } from './env'

export async function connectDatabase() {
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
  })
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
