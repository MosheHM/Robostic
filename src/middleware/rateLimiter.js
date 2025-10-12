const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible')

let rateLimiter

// Initialize rate limiter with fallback to memory
const initRateLimiter = () => {
  try {
    // Try Redis-based rate limiter first
    if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
      const redis = require('redis')
      const redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      })

      redisClient.on('error', (err) => {
        console.warn('Redis connection failed, falling back to memory-based rate limiter:', err.message)
        initMemoryRateLimiter()
      })

      rateLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'robostic_rl',
        points: 100, // Number of requests
        duration: 60, // Per 60 seconds
        blockDuration: 60 // Block for 60 seconds if limit exceeded
      })
    } else {
      initMemoryRateLimiter()
    }
  } catch (error) {
    console.warn('Failed to initialize Redis rate limiter, using memory fallback:', error.message)
    initMemoryRateLimiter()
  }
}

const initMemoryRateLimiter = () => {
  rateLimiter = new RateLimiterMemory({
    keyPrefix: 'robostic_rl',
    points: 100,
    duration: 60,
    blockDuration: 60
  })
}

initRateLimiter()

const rateLimiterMiddleware = async (req, res, next) => {
  try {
    if (!rateLimiter) {
      return next()
    }

    const key = req.ip || req.connection.remoteAddress
    await rateLimiter.consume(key)
    next()
  } catch (rejRes) {
    const secs = Math.round(rejRes.msBeforeNext / 1000) || 1
    res.set('Retry-After', String(secs))
    res.status(429).json({
      success: false,
      message: 'Too many requests',
      retryAfter: secs
    })
  }
}

module.exports = rateLimiterMiddleware
