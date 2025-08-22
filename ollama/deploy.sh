#!/bin/bash

# Ollama Deployment Script for Taskego
# This script helps deploy Ollama to different environments

set -e

echo "🚀 Taskego Ollama Deployment Script"
echo "=================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to deploy locally
deploy_local() {
    echo "📦 Deploying Ollama locally..."
    
    # Build and start the container
    docker-compose up -d --build
    
    # Wait for Ollama to be ready
    echo "⏳ Waiting for Ollama to start..."
    sleep 10
    
    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "✅ Ollama is running successfully!"
        echo "🌐 Access URL: http://localhost:11434"
        echo "🔧 API Endpoint: http://localhost:11434/api"
    else
        echo "❌ Ollama failed to start. Check logs with: docker logs taskego-ollama"
        exit 1
    fi
}

# Function to deploy to cloud
deploy_cloud() {
    echo "☁️  Deploying Ollama to cloud..."
    
    # Check if REMOTE_HOST is set
    if [ -z "$REMOTE_HOST" ]; then
        echo "❌ Please set REMOTE_HOST environment variable"
        echo "Example: export REMOTE_HOST=user@your-server.com"
        exit 1
    fi
    
    echo "📤 Copying files to $REMOTE_HOST..."
    scp -r . $REMOTE_HOST:~/ollama
    
    echo "🔧 Setting up Ollama on remote server..."
    ssh $REMOTE_HOST << 'EOF'
        cd ~/ollama
        docker-compose up -d --build
        
        # Wait for Ollama to start
        sleep 15
        
        # Check if running
        if curl -s http://localhost:11434/api/tags > /dev/null; then
            echo "✅ Ollama is running on remote server!"
        else
            echo "❌ Ollama failed to start on remote server"
            exit 1
        fi
    EOF
    
    echo "✅ Ollama deployed to cloud successfully!"
    echo "🌐 Remote URL: http://$REMOTE_HOST:11434"
}

# Function to pull models
pull_models() {
    echo "📥 Pulling Ollama models..."
    
    # Check if Ollama is running
    if ! curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "❌ Ollama is not running. Start it first with: docker-compose up -d"
        exit 1
    fi
    
    echo "📥 Pulling llama2:7b (fast, good for basic responses)..."
    docker exec taskego-ollama ollama pull llama2:7b
    
    echo "📥 Pulling llama2:13b (balanced speed/quality, recommended)..."
    docker exec taskego-ollama ollama pull llama2:13b
    
    echo "✅ Models pulled successfully!"
    echo "📋 Available models:"
    docker exec taskego-ollama ollama list
}

# Function to test Ollama
test_ollama() {
    echo "🧪 Testing Ollama..."
    
    if ! curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "❌ Ollama is not running. Start it first with: docker-compose up -d"
        exit 1
    fi
    
    echo "📝 Testing basic response..."
    response=$(curl -s -X POST http://localhost:11434/api/generate \
        -H "Content-Type: application/json" \
        -d '{
            "model": "llama2:7b",
            "prompt": "Hello, can you help me with Taskego services?",
            "stream": false
        }')
    
    if echo "$response" | grep -q "response"; then
        echo "✅ Ollama is responding correctly!"
        echo "📝 Response preview:"
        echo "$response" | jq -r '.response' | head -c 100
        echo "..."
    else
        echo "❌ Ollama test failed. Response: $response"
        exit 1
    fi
}

# Function to show status
show_status() {
    echo "📊 Ollama Status"
    echo "================"
    
    if docker ps | grep -q taskego-ollama; then
        echo "✅ Container is running"
        echo "🆔 Container ID: $(docker ps --filter name=taskego-ollama --format '{{.ID}}')"
        echo "🌐 Port: 11434"
        
        if curl -s http://localhost:11434/api/tags > /dev/null; then
            echo "🔌 API is responding"
            echo "📋 Available models:"
            docker exec taskego-ollama ollama list 2>/dev/null || echo "No models loaded"
        else
            echo "❌ API is not responding"
        fi
    else
        echo "❌ Container is not running"
        echo "💡 Start it with: docker-compose up -d"
    fi
}

# Function to show logs
show_logs() {
    echo "📋 Ollama Logs"
    echo "=============="
    docker logs taskego-ollama --tail 50 -f
}

# Function to stop Ollama
stop_ollama() {
    echo "🛑 Stopping Ollama..."
    docker-compose down
    echo "✅ Ollama stopped"
}

# Function to show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  local     Deploy Ollama locally"
    echo "  cloud     Deploy Ollama to cloud (requires REMOTE_HOST)"
    echo "  models    Pull recommended models"
    echo "  test      Test Ollama functionality"
    echo "  status    Show Ollama status"
    echo "  logs      Show Ollama logs"
    echo "  stop      Stop Ollama"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 local                    # Deploy locally"
    echo "  $0 cloud                    # Deploy to cloud"
    echo "  export REMOTE_HOST=user@server.com && $0 cloud"
    echo "  $0 models                   # Pull models"
    echo "  $0 test                     # Test Ollama"
}

# Main script logic
case "${1:-help}" in
    "local")
        deploy_local
        ;;
    "cloud")
        deploy_cloud
        ;;
    "models")
        pull_models
        ;;
    "test")
        test_ollama
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_ollama
        ;;
    "help"|*)
        show_help
        ;;
esac
