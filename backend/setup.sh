#!/bin/bash

# LUMANARA Backend Setup Script
# This script helps set up the backend with PostgreSQL

set -e

echo "🚀 LUMANARA Backend Setup"
echo "========================"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Copy .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please update it if needed."
else
    echo "✅ .env file already exists"
fi

echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 10

echo ""
echo "✅ Backend setup complete!"
echo ""
echo "📍 API Server: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo "🔍 ReDoc: http://localhost:8000/redoc"
echo ""
echo "🛑 To stop the backend:"
echo "   docker-compose down"
echo ""
