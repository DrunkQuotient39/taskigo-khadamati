@echo off
echo Testing Ollama AI for Taskego...
echo.

REM Check if Ollama is running
echo Checking if Ollama is running...
curl -f http://localhost:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Ollama is not running!
    echo Please run start-ollama.bat first.
    pause
    exit /b 1
)

echo ✅ Ollama is running!

REM Test basic API
echo.
echo Testing Ollama API...
curl -s http://localhost:11434/api/tags

echo.
echo.

REM Test chat functionality
echo Testing chat functionality...
curl -X POST http://localhost:11434/api/chat -H "Content-Type: application/json" -d "{\"model\":\"llama3.2:3b-instruct\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello! I'm using Taskego. Can you help me find a cleaning service?\"}],\"stream\":false}"

echo.
echo.
echo ✅ Ollama test completed!
echo.
echo If you see JSON responses above, Ollama is working correctly.
echo You can now use AI chat in Taskego!
echo.
pause
