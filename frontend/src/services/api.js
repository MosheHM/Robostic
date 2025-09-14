import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api/v1'

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('token')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.api.defaults.headers.common['Authorization']
    }
  }

  // Generic HTTP methods
  async get(url, config = {}) {
    return this.api.get(url, config)
  }

  async post(url, data = {}, config = {}) {
    return this.api.post(url, data, config)
  }

  async put(url, data = {}, config = {}) {
    return this.api.put(url, data, config)
  }

  async delete(url, config = {}) {
    return this.api.delete(url, config)
  }

  // Authentication endpoints
  async login(email, password) {
    return this.post('/auth/login', { email, password })
  }

  async register(userData) {
    return this.post('/auth/register', userData)
  }

  async getProfile() {
    return this.get('/auth/me')
  }

  // Robot endpoints
  async getRobots(params = {}) {
    return this.get('/robots', { params })
  }

  async getRobot(id) {
    return this.get(`/robots/${id}`)
  }

  async createRobot(robotData) {
    return this.post('/robots', robotData)
  }

  async updateRobot(id, robotData) {
    return this.put(`/robots/${id}`, robotData)
  }

  async deleteRobot(id) {
    return this.delete(`/robots/${id}`)
  }

  async getRobotStatus(id) {
    return this.get(`/robots/${id}/status`)
  }

  async moveRobot(id, moveData) {
    return this.post(`/robots/${id}/move`, moveData)
  }

  async controlGripper(id, gripperData) {
    return this.post(`/robots/${id}/gripper`, gripperData)
  }

  // AI endpoints
  async processCommand(text, context = {}) {
    return this.post('/ai/command', { text, context })
  }

  async analyzeScene(image, context = {}) {
    return this.post('/ai/analyze-scene', { image, context })
  }

  async generatePlan(task, robotCapabilities, environment, constraints) {
    return this.post('/ai/generate-plan', {
      task,
      robotCapabilities,
      environment,
      constraints
    })
  }

  // Health check
  async healthCheck() {
    return this.api.get('/health')
  }
}

const api = new ApiService()
export default api