@echo off
echo Preparing Taskego for Render deployment...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: Please run this script from the project root directory
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

echo ✅ Project root found
echo.

REM Check if build works
echo Building project for production...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Please fix the errors above
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.

REM Check if dist folder exists
if not exist "dist" (
    echo ❌ Build output not found. Check build configuration.
    pause
    exit /b 1
)

echo ✅ Production build ready
echo.

REM Show deployment checklist
echo ========================================
echo 🚀 RENDER DEPLOYMENT CHECKLIST
echo ========================================
echo.
echo 1. ✅ Project builds successfully
echo 2. ✅ Production files in dist/ folder
echo 3. ⏳ Need Firebase Admin SDK keys
echo 4. ⏳ Need to set environment variables
echo 5. ⏳ Need to deploy Ollama to cloud
echo.
echo ========================================
echo.
echo 📋 Next steps:
echo 1. Go to https://render.com
echo 2. Sign up and choose Starter plan ($7/month)
echo 3. Connect your GitHub repository
echo 4. Deploy backend as Web Service
echo 5. Deploy frontend as Static Site
echo 6. Set environment variables
echo.
echo 📖 See RENDER_DEPLOYMENT_GUIDE.md for details
echo.
pause
