const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const { createServer } = require('http')
const { Server } = require('socket.io')
const mongoose = require('mongoose')
require('dotenv').config()

const logger = require('./utils/logger')
const errorHandler = require('./middleware/errorHandler')
const rateLimiter = require('./middleware/rateLimiter')

// Import routes
const authRoutes = require('./routes/auth')
const robotRoutes = require('./routes/robots')
const projectRoutes = require('./routes/projects')
const visionRoutes = require('./routes/vision')
const aiRoutes = require('./routes/ai')
const telemetryRoutes = require('./routes/telemetry')
const simulationRoutes = require('./routes/simulation')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(helmet())
app.use(cors())
app.use(compression())
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(rateLimiter)

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  })
})

// API Documentation
if (process.env.NODE_ENV !== 'production') {
  const swaggerJsdoc = require('swagger-jsdoc')
  const swaggerUi = require('swagger-ui-express')

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Robostic API',
        version: '1.0.0',
        description: 'AI Robotics Cloud Platform API Documentation',
        contact: {
          name: 'Robostic Support',
          email: 'support@robostic.com'
        }
      },
      servers: [
        {
          url: process.env.API_URL || 'http://localhost:3000',
          description: 'Development server'
        }
      ]
    },
    apis: ['./src/routes/*.js', './src/models/*.js']
  }

  const specs = swaggerJsdoc(options)
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs))
}

// API Routes
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/robots', robotRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/vision', visionRoutes)
app.use('/api/v1/ai', aiRoutes)
app.use('/api/v1/telemetry', telemetryRoutes)
app.use('/api/v1/simulation', simulationRoutes)

// Socket.IO for real-time communication
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  socket.on('join-robot', (robotId) => {
    socket.join(`robot-${robotId}`)
    logger.info(`Client ${socket.id} joined robot room: robot-${robotId}`)
  })

  socket.on('robot-command', (data) => {
    const { robotId, command } = data
    // Broadcast command to specific robot room
    socket.to(`robot-${robotId}`).emit('execute-command', command)
    logger.info(`Command sent to robot ${robotId}: ${JSON.stringify(command)}`)
  })

  socket.on('telemetry-data', (data) => {
    const { robotId, telemetry } = data
    // Broadcast telemetry to robot room
    socket.to(`robot-${robotId}`).emit('telemetry-update', telemetry)
  })

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  })
})

// Database connection
const connectDB = async () => {
  if (process.env.MONGODB_DISABLED === 'true' || process.env.DATABASE_URL === 'skip') {
    logger.info('MongoDB connection skipped for testing')
    return
  }

  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL || 'mongodb://localhost:27017/robostic', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error('Database connection failed:', error)
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1)
    }
  }
}

// Start server
const PORT = process.env.PORT || 3000
const startServer = async () => {
  await connectDB()

  server.listen(PORT, () => {
    logger.info(`🚀 Robostic server running on port ${PORT}`)
    logger.info(`📚 API Documentation: http://localhost:${PORT}/docs`)
    logger.info(`🔍 Health Check: http://localhost:${PORT}/health`)
  })
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    mongoose.connection.close()
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  server.close(() => {
    logger.info('Process terminated')
    mongoose.connection.close()
    process.exit(0)
  })
})

startServer().catch(error => {
  logger.error('Failed to start server:', error)
  process.exit(1)
})

module.exports = { app, io }
