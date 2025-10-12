const request = require('supertest')
const { app } = require('../../src/server')

// Mock auth middleware to simulate authenticated user
jest.mock('../../src/middleware/auth', () => ({
  auth: (req, res, next) => {
    req.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'developer'
    }
    next()
  }
}))

describe('AI Services API', () => {
  describe('POST /api/v1/ai/command', () => {
    test('should process a valid natural language command', async () => {
      const response = await request(app)
        .post('/api/v1/ai/command')
        .send({
          text: 'Pick up the red block',
          context: {
            robotId: 'robot-123',
            environment: 'construction'
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('originalText', 'Pick up the red block')
      expect(response.body.data).toHaveProperty('processedCommand')
      expect(response.body.data).toHaveProperty('confidence')
      expect(response.body.data).toHaveProperty('executionSteps')
      expect(response.body.data.processedCommand).toHaveProperty('action')
    })

    test('should return 400 for empty command text', async () => {
      const response = await request(app)
        .post('/api/v1/ai/command')
        .send({
          text: '',
          context: {}
        })
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('message', 'Command text is required')
    })

    test('should return 400 for missing command text', async () => {
      const response = await request(app)
        .post('/api/v1/ai/command')
        .send({
          context: {}
        })
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('message', 'Command text is required')
    })

    test('should handle move commands', async () => {
      const response = await request(app)
        .post('/api/v1/ai/command')
        .send({
          text: 'Move to the table',
          context: {}
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.processedCommand.action).toBe('move')
    })

    test('should handle grab commands', async () => {
      const response = await request(app)
        .post('/api/v1/ai/command')
        .send({
          text: 'Grab the tool',
          context: {}
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.processedCommand.action).toBe('grasp')
    })

    test('should handle inspect commands', async () => {
      const response = await request(app)
        .post('/api/v1/ai/command')
        .send({
          text: 'Inspect the component',
          context: {}
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.processedCommand.action).toBe('inspect')
    })
  })

  describe('POST /api/v1/ai/analyze-scene', () => {
    test('should analyze a scene image', async () => {
      const response = await request(app)
        .post('/api/v1/ai/analyze-scene')
        .send({
          image: 'base64-encoded-image-data',
          context: {
            industry: 'construction'
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('objects')
      expect(response.body.data).toHaveProperty('safetyIssues')
      expect(response.body.data).toHaveProperty('recommendations')
      expect(Array.isArray(response.body.data.objects)).toBe(true)
      expect(Array.isArray(response.body.data.safetyIssues)).toBe(true)
    })

    test('should detect safety issues for construction industry', async () => {
      const response = await request(app)
        .post('/api/v1/ai/analyze-scene')
        .send({
          image: 'base64-encoded-image-data',
          context: {
            industry: 'construction'
          }
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.safetyIssues.length).toBeGreaterThan(0)
    })

    test('should return 400 for missing image data', async () => {
      const response = await request(app)
        .post('/api/v1/ai/analyze-scene')
        .send({
          context: {}
        })
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('message', 'Image data is required')
    })
  })

  describe('POST /api/v1/ai/generate-plan', () => {
    test('should generate a task execution plan', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate-plan')
        .send({
          task: 'Assemble the component',
          robotCapabilities: ['pick_and_place', 'welding'],
          environment: {
            workspace: 'factory_floor'
          },
          constraints: {
            timeLimit: 300
          }
        })
        .expect('Content-Type', /json/)
        .expect(200)

      expect(response.body).toHaveProperty('success', true)
      expect(response.body.data).toHaveProperty('task')
      expect(response.body.data).toHaveProperty('steps')
      expect(response.body.data).toHaveProperty('totalEstimatedDuration')
      expect(response.body.data).toHaveProperty('riskAssessment')
      expect(response.body.data).toHaveProperty('alternatives')
      expect(Array.isArray(response.body.data.steps)).toBe(true)
    })

    test('should return 400 for missing task description', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate-plan')
        .send({
          robotCapabilities: []
        })
        .expect('Content-Type', /json/)
        .expect(400)

      expect(response.body).toHaveProperty('success', false)
      expect(response.body).toHaveProperty('message', 'Task description is required')
    })

    test('should handle task with minimal parameters', async () => {
      const response = await request(app)
        .post('/api/v1/ai/generate-plan')
        .send({
          task: 'Simple pick and place operation'
        })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data.steps.length).toBeGreaterThan(0)
    })
  })
})
