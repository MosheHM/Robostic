# Contributing to Robostic

We welcome contributions to the Robostic AI Robotics Cloud Platform! This document outlines how to contribute to the project.

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm 9+
- Docker and Docker Compose (optional)
- Git

### Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/Robostic.git
   cd Robostic
   ```

2. **Install Dependencies**
   ```bash
   npm run setup
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Option 1: Use Docker Compose (recommended)
   docker-compose up -d

   # Option 2: Manual setup
   npm run start:dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/docs

## Project Structure

```
Robostic/
├── src/                     # Backend source code
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   └── server.js           # Main server file
├── frontend/               # React frontend application
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Frontend utilities
│   └── package.json       # Frontend dependencies
├── tests/                  # Test files
├── config/                 # Configuration files
├── scripts/                # Build and deployment scripts
├── docker-compose.yml      # Docker orchestration
├── Dockerfile             # Container definition
└── README.md              # Main documentation
```

## Development Guidelines

### Code Style
- Use ESLint for JavaScript linting
- Follow the existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic

### Commit Messages
Follow conventional commit format:
```
type(scope): description

Examples:
feat(api): add robot control endpoints
fix(frontend): resolve authentication redirect issue
docs(readme): update installation instructions
```

### API Development

#### Adding New Endpoints
1. Create route in `src/routes/`
2. Add controller in `src/controllers/`
3. Update API documentation with Swagger comments
4. Add tests in `tests/`

#### Example Route Structure
```javascript
/**
 * @swagger
 * /api/v1/example:
 *   get:
 *     summary: Example endpoint
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/example', auth, async (req, res, next) => {
  try {
    // Implementation
    res.status(200).json({ success: true, data: {} })
  } catch (error) {
    next(error)
  }
})
```

### Frontend Development

#### Component Guidelines
- Use Material-UI components when possible
- Follow React hooks patterns
- Implement proper error handling and loading states
- Use TypeScript for new components (migration in progress)

#### Adding New Pages
1. Create page component in `src/pages/`
2. Add route in `App.js`
3. Update navigation if needed
4. Add to the authenticated/unauthenticated route structure

#### State Management
- Use React Context for global state
- Local state for component-specific data
- API calls through the centralized API service

### Testing

#### Backend Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

#### Frontend Tests
```bash
cd frontend
npm test
```

#### Integration Tests
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up

# Run integration tests
npm run test:integration
```

### Database Models

#### Adding New Models
1. Create model file in `src/models/`
2. Define schema with validation
3. Add indexes for performance
4. Include Swagger documentation

#### Example Model
```javascript
const mongoose = require('mongoose')

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  // ... other fields
}, {
  timestamps: true
})

// Indexes
exampleSchema.index({ name: 1 })

module.exports = mongoose.model('Example', exampleSchema)
```

## Deployment

### Environment Variables
Required environment variables for production:
- `NODE_ENV=production`
- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis connection string
- `OPENAI_API_KEY` - OpenAI API key

### Docker Deployment
```bash
# Build production image
docker build -t robostic .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Manual Deployment
```bash
# Install dependencies
npm ci --only=production

# Build frontend
cd frontend && npm run build && cd ..

# Start server
NODE_ENV=production npm start
```

## Issue Reporting

### Bug Reports
Please include:
- Environment details (OS, Node.js version)
- Steps to reproduce
- Expected vs actual behavior
- Error logs if applicable
- Screenshots for UI issues

### Feature Requests
Please include:
- Use case description
- Proposed solution
- Alternative solutions considered
- Additional context

## Pull Request Process

1. **Fork the Repository**
   ```bash
   git fork https://github.com/MosheHM/Robostic.git
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow code style guidelines
   - Add tests for new features
   - Update documentation

4. **Test Your Changes**
   ```bash
   npm test
   npm run lint
   ```

5. **Commit and Push**
   ```bash
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Use clear title and description
   - Reference related issues
   - Include screenshots for UI changes

### PR Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or properly documented)
- [ ] Security considerations addressed

## API Documentation

### Swagger/OpenAPI
- API documentation auto-generated from code comments
- Available at `/docs` endpoint in development
- Update schemas when modifying models

### Adding API Documentation
```javascript
/**
 * @swagger
 * components:
 *   schemas:
 *     ExampleModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 */
```

## Security

### Reporting Vulnerabilities
Please report security vulnerabilities to security@robostic.com

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables for configuration
- Validate all user inputs
- Follow OWASP security practices
- Keep dependencies updated

## Community

### Getting Help
- GitHub Discussions for questions
- Discord server for real-time chat
- Stack Overflow with `robostic` tag

### Code of Conduct
We follow the [Contributor Covenant](https://www.contributor-covenant.org/version/2/0/code_of_conduct/).

## License

By contributing to Robostic, you agree that your contributions will be licensed under the Apache License 2.0.