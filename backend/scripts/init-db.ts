import mongoose from 'mongoose'
import config from '../src/config'
import logger from '../src/utils/logger'
import { FormModel } from '../src/models/Form'
import { FormSubmissionModel } from '../src/models/FormSubmission'

async function initDb() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri)
    logger.info('Connected to MongoDB')

    // Create indexes
    await Promise.all([
      FormModel.createIndexes(),
      FormSubmissionModel.createIndexes(),
    ])
    logger.info('Created database indexes')

    // Add any initial data if needed
    // const sampleForm = new FormModel({...})
    // await sampleForm.save()

    logger.info('Database initialization completed')
    process.exit(0)
  } catch (error) {
    logger.error('Database initialization failed:', error)
    process.exit(1)
  }
}

initDb()
