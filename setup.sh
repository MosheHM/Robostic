#!/bin/bash

# Robostic Setup Script
# This script sets up the complete development environment

set -e

echo "🤖 Robostic AI Robotics Cloud Platform Setup"
echo "============================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Check Docker (optional)
if command -v docker &> /dev/null; then
    echo "✅ Docker $(docker -v | cut -d ' ' -f 3 | cut -d ',' -f 1)"
    DOCKER_AVAILABLE=true
else
    echo "⚠️  Docker not found (optional for manual setup)"
    DOCKER_AVAILABLE=false
fi

echo ""

# Setup environment
echo "🔧 Setting up environment..."

if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please review and update configuration."
else
    echo "✅ .env file already exists"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install
echo "✅ Backend dependencies installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"

# Create logs directory
mkdir -p logs
echo "✅ Logs directory created"

# Setup database (if Docker is available)
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo ""
    echo "🐳 Docker Setup Options:"
    echo "1. Start with Docker Compose (recommended)"
    echo "2. Manual setup (skip Docker)"
    echo "3. Exit"
    
    read -p "Choose option (1-3): " SETUP_CHOICE
    
    case $SETUP_CHOICE in
        1)
            echo "🚀 Starting services with Docker Compose..."
            docker-compose up -d
            echo "✅ Services started successfully!"
            echo ""
            echo "🌐 Access your application:"
            echo "   Frontend: http://localhost:3001"
            echo "   Backend API: http://localhost:3000"
            echo "   API Docs: http://localhost:3000/docs"
            echo ""
            echo "🛑 To stop services: docker-compose down"
            ;;
        2)
            echo "📋 Manual setup selected"
            ;;
        3)
            echo "👋 Setup cancelled"
            exit 0
            ;;
        *)
            echo "❌ Invalid option"
            exit 1
            ;;
    esac
else
    echo "📋 Manual setup (Docker not available)"
fi

# Manual setup instructions
if [ "$DOCKER_AVAILABLE" != true ] || [ "$SETUP_CHOICE" = "2" ]; then
    echo ""
    echo "📋 Manual Setup Instructions:"
    echo ""
    echo "1. Start MongoDB (required for full functionality):"
    echo "   - Install MongoDB locally, or"
    echo "   - Use MongoDB Atlas (cloud), or"
    echo "   - Run: docker run -d -p 27017:27017 --name robostic-mongo mongo:7.0"
    echo ""
    echo "2. Start Redis (optional, for rate limiting):"
    echo "   - Install Redis locally, or"
    echo "   - Run: docker run -d -p 6379:6379 --name robostic-redis redis:7.2-alpine"
    echo ""
    echo "3. Update .env file with your database URLs"
    echo ""
    echo "4. Start the development servers:"
    echo "   - Backend: npm run dev"
    echo "   - Frontend: cd frontend && npm start"
    echo "   - Or both: npm run start:dev"
    echo ""
    echo "5. Access your application:"
    echo "   - Frontend: http://localhost:3001"
    echo "   - Backend API: http://localhost:3000"
    echo "   - API Docs: http://localhost:3000/docs"
fi

# Run tests
echo ""
echo "🧪 Running tests..."
NODE_ENV=test MONGODB_DISABLED=true npm test
echo "✅ Tests completed"

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "📚 Next Steps:"
echo "1. Review the README.md for detailed documentation"
echo "2. Check CONTRIBUTING.md for development guidelines"
echo "3. Visit the API documentation at /docs endpoint"
echo "4. Explore the example robots and simulations"
echo ""
echo "🔗 Useful Commands:"
echo "   npm run dev          # Start backend in development mode"
echo "   npm run start:dev    # Start both backend and frontend"
echo "   npm test            # Run tests"
echo "   npm run lint        # Check code style"
echo "   docker-compose up   # Start with Docker"
echo ""
echo "📞 Need Help?"
echo "   - Documentation: README.md"
echo "   - Issues: https://github.com/MosheHM/Robostic/issues"
echo "   - Discussions: https://github.com/MosheHM/Robostic/discussions"
echo ""
echo "Happy coding! 🚀"