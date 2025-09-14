const request = require('supertest')
const { app } = require('../../src/server')

describe('Health Check API', () => {
  test('GET /health should return 200 OK', async () => {
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(response.body).toHaveProperty('status', 'OK')
    expect(response.body).toHaveProperty('timestamp')
    expect(response.body).toHaveProperty('uptime')
  })
})

describe('API Documentation', () => {
  test('GET /docs should be accessible in development', async () => {
    if (process.env.NODE_ENV !== 'production') {
      const response = await request(app)
        .get('/docs')
        .expect(200)
    }
  })
})

describe('404 Handler', () => {
  test('Unknown routes should return 404', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect('Content-Type', /json/)
      .expect(404)

    expect(response.body).toHaveProperty('success', false)
    expect(response.body).toHaveProperty('message', 'Route not found')
  })
})