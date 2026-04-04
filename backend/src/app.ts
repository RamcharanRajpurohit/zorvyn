import compression from 'compression'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { env } from './config/env'
import authRoutes from './modules/auth/auth.routes'
import userRoutes from './modules/users/user.routes'
import recordRoutes from './modules/records/record.routes'
import dashboardRoutes from './modules/dashboard/dashboard.routes'
import { errorHandler } from './middleware/error-handler'
import { notFoundHandler } from './middleware/not-found'
import { authenticate } from './middleware/authenticate'
import { attachRequestContext } from './middleware/request-context'
import { createRequestLogger } from './middleware/request-logger'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: false,
    })
  )
  app.use(compression())
  app.use(attachRequestContext)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(createRequestLogger())
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
    })
  )

  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'Backend is healthy',
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    })
  })

  app.use(`${env.API_PREFIX}/auth`, authRoutes)
  app.use(`${env.API_PREFIX}/users`, authenticate, userRoutes)
  app.use(`${env.API_PREFIX}/records`, authenticate, recordRoutes)
  app.use(`${env.API_PREFIX}/dashboard`, authenticate, dashboardRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
