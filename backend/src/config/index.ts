import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config()

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/form-filler',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  puppeteer: {
    headless: process.env.PUPPETEER_HEADLESS !== 'false',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080',
    ],
  },
  logs: {
    dir: path.join(__dirname, '../../logs'),
    level: process.env.LOG_LEVEL || 'info',
  },
} as const

export default config
