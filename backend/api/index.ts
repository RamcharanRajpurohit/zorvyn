import { connectDatabase } from '../src/config/db'
import { createApp } from '../src/app'

let connected = false

const app = createApp()

export default async function handler(req: any, res: any) {
  if (!connected) {
    await connectDatabase()
    connected = true
  }
  app(req, res)
}
