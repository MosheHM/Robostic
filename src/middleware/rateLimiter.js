const { RateLimiterRedis } = require('rate-limiter-flexible')
const redis = require('redis')

let rateLimiter

// Initialize Redis client if available
const initRateLimiter = () => {
  try {
    const redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })

    rateLimiter = new RateLimiterRedis({
      storeClient: redisClient,
      keyPrefix: 'robostic_rl',
      points: 100, // Number of requests
      duration: 60, // Per 60 seconds
      blockDuration: 60 // Block for 60 seconds if limit exceeded
    })
  } catch (error) {
    // Fallback to memory-based rate limiter
    const { RateLimiterMemory } = require('rate-limiter-flexible')
    rateLimiter = new RateLimiterMemory({
      keyPrefix: 'robostic_rl',
      points: 100,
      duration: 60,
      blockDuration: 60
    })
  }
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