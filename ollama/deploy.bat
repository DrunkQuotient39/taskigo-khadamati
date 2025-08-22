@echo off
setlocal enabledelayedexpansion

echo 🚀 Taskego Ollama Deployment Script
echo ==================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

if "%1"=="local" goto :deploy_local
if "%1"=="models" goto :pull_models
if "%1"=="test" goto :test_ollama
if "%1"=="status" goto :show_status
if "%1"=="logs" goto :show_logs
if "%1"=="stop" goto :stop_ollama
if "%1"=="help" goto :show_help
goto :show_help

:deploy_local
echo 📦 Deploying Ollama locally...
docker-compose up -d --build
if errorlevel 1 (
    echo ❌ Failed to start Ollama. Check if Docker is running.
    pause
    exit /b 1
)

echo ⏳ Waiting for Ollama to start...
timeout /t 10 /nobreak >nul

echo 🔍 Checking if Ollama is running...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama failed to start. Check logs with: docker logs taskego-ollama
    pause
    exit /b 1
)

echo ✅ Ollama is running successfully!
echo 🌐 Access URL: http://localhost:11434
echo 🔧 API Endpoint: http://localhost:11434/api
goto :end

:pull_models
echo 📥 Pulling Ollama models...

curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama is not running. Start it first with: docker-compose up -d
    pause
    exit /b 1
)

echo 📥 Pulling llama2:7b (fast, good for basic responses)...
docker exec taskego-ollama ollama pull llama2:7b

echo 📥 Pulling llama2:13b (balanced speed/quality, recommended)...
docker exec taskego-ollama ollama pull llama2:13b

echo ✅ Models pulled successfully!
echo 📋 Available models:
docker exec taskego-ollama ollama list
goto :end

:test_ollama
echo 🧪 Testing Ollama...

curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama is not running. Start it first with: docker-compose up -d
    pause
    exit /b 1
)

echo 📝 Testing basic response...
curl -s -X POST http://localhost:11434/api/generate -H "Content-Type: application/json" -d "{\"model\": \"llama2:7b\", \"prompt\": \"Hello, can you help me with Taskego services?\", \"stream\": false}" > test_response.json

if exist test_response.json (
    echo ✅ Ollama is responding correctly!
    echo 📝 Response saved to test_response.json
    del test_response.json
) else (
    echo ❌ Ollama test failed.
)
goto :end

:show_status
echo 📊 Ollama Status
echo ================

docker ps | findstr taskego-ollama >nul
if errorlevel 1 (
    echo ❌ Container is not running
    echo 💡 Start it with: docker-compose up -d
) else (
    echo ✅ Container is running
    echo 🌐 Port: 11434
    
    curl -s http://localhost:11434/api/tags >nul 2>&1
    if errorlevel 1 (
        echo ❌ API is not responding
    ) else (
        echo 🔌 API is responding
        echo 📋 Available models:
        docker exec taskego-ollama ollama list 2>nul || echo No models loaded
    )
)
goto :end

:show_logs
echo 📋 Ollama Logs
echo ==============
docker logs taskego-ollama --tail 50 -f
goto :end

:stop_ollama
echo 🛑 Stopping Ollama...
docker-compose down
echo ✅ Ollama stopped
goto :end

:show_help
echo Usage: %0 [COMMAND]
echo.
echo Commands:
echo   local     Deploy Ollama locally
echo   models    Pull recommended models
echo   test      Test Ollama functionality
echo   status    Show Ollama status
echo   logs      Show Ollama logs
echo   stop      Stop Ollama
echo   help      Show this help message
echo.
echo Examples:
echo   %0 local                    # Deploy locally
echo   %0 models                   # Pull models
echo   %0 test                     # Test Ollama
echo   %0 status                   # Show status
goto :end

:end
pause
