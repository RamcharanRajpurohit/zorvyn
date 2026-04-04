import { createServer } from 'node:http'
import { connectDatabase } from './config/db'
import { env } from './config/env'
import { createApp } from './app'

async function startServer() {
  await connectDatabase()

  const app = createApp()
  const server = createServer(app)

  server.listen(env.PORT, () => {
    console.log(`Backend running on http://localhost:${env.PORT}`)
  })
}

void startServer().catch((error) => {
  console.error('Failed to start backend', error)
  process.exit(1)
})
