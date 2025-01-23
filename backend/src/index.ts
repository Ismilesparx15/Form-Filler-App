import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import formRoutes from './routes/form.routes'
import { errorHandler } from './middleware/errorHandler'
import config from './config'
import logger from './utils/logger'

const app = express()

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
  })
  next()
})

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Form Filler API Server',
    version: '1.0.0',
    endpoints: {
      forms: '/api/forms',
      analyze: '/api/forms/analyze',
      submit: '/api/forms/:id/submit',
      submissions: '/api/forms/:id/submissions',
    }
  })
})

app.use('/api/forms', formRoutes)

// Error handling
app.use(errorHandler)

// Connect to MongoDB and start server
mongoose
  .connect(config.mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB')
    app.listen(config.port, () => {
      logger.info(`Server is running on port ${config.port}`)
    })
  })
  .catch((error) => {
    logger.error('Error connecting to MongoDB:', error)
    process.exit(1)
  })

// Handle unhandled promise rejections
process.on('unhandledRejection', (error: Error) => {
  logger.error('Unhandled Promise Rejection:', error)
  process.exit(1)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})
