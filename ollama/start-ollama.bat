@echo off
echo Starting Taskego Ollama AI...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    echo.
    pause
    exit /b 1
)

echo Docker is running. Starting Ollama...
echo.

REM Start Ollama container
docker-compose up -d

echo.
echo Waiting for Ollama to start...
timeout /t 10 /nobreak >nul

REM Check if Ollama is responding
echo Testing Ollama connection...
curl -f http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo ✅ Ollama is running successfully!
    echo 🌐 Access Ollama at: http://localhost:11434
    echo 🤖 AI Chat is now available in Taskego!
    echo.
    echo To stop Ollama, run: docker-compose down
) else (
    echo.
    echo ⚠️  Ollama might still be starting up...
    echo Please wait a few more minutes and try again.
)

echo.
pause
