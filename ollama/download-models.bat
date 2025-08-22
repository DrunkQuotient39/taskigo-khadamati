@echo off
echo Downloading Ollama models for Taskego...
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Ollama is running
curl -f http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Ollama is not running!
    echo Please run start-ollama.bat first.
    pause
    exit /b 1
)

echo Downloading Llama 3.2 3B model (recommended for Taskego)...
docker exec taskego-ollama ollama pull llama3.2:3b-instruct

echo.
echo Downloading Llama 3.2 8B model (better quality, more resources)...
docker exec taskego-ollama ollama pull llama3.2:8b-instruct

echo.
echo Downloading Mistral 7B model (alternative option)...
docker exec taskego-ollama ollama pull mistral:7b-instruct

echo.
echo ✅ All models downloaded successfully!
echo.
echo Available models:
docker exec taskego-ollama ollama list

echo.
echo 💡 You can now use AI chat in Taskego!
echo 🌐 Test Ollama at: http://localhost:11434
echo.
pause
