# Taskigo Authentication Flow Test Script using curl (PowerShell version)
# Usage: .\test-auth-curl.ps1 <firebase-token>

# Check if token is provided
if (-not $args[0]) {
    Write-Host "Error: Firebase token is required" -ForegroundColor Red
    Write-Host "Usage: .\test-auth-curl.ps1 <firebase-token>"
    exit 1
}

# Configuration
$API_URL = if ($env:API_URL) { $env:API_URL } else { "http://localhost:5000" }
$FIREBASE_TOKEN = $args[0]

Write-Host "🔍 Starting authentication flow test with curl"
Write-Host "🌐 API URL: $API_URL"
Write-Host "🔑 Firebase token provided: Yes (first 15 chars): $($FIREBASE_TOKEN.Substring(0, [Math]::Min(15, $FIREBASE_TOKEN.Length)))..."

Write-Host "`n📡 Testing /api/auth/me-firebase endpoint..."
Write-Host "curl -s -H 'Authorization: Bearer $FIREBASE_TOKEN' $API_URL/api/auth/me-firebase"

# Make the request and capture response
$RESPONSE = Invoke-RestMethod -Uri "$API_URL/api/auth/me-firebase" -Headers @{Authorization="Bearer $FIREBASE_TOKEN"} -Method Get -ErrorVariable responseError -SkipHttpErrorCheck

# Get status code
$STATUS_CODE = if ($responseError) { $responseError.Exception.Response.StatusCode.value__ } else { 200 }

Write-Host "`n📊 Status code: $STATUS_CODE"

if ($STATUS_CODE -eq 200) {
    Write-Host "✅ Authentication successful!" -ForegroundColor Green
    Write-Host "👤 User data:"
    
    Write-Host "   - ID: $($RESPONSE.id)"
    Write-Host "   - Email: $($RESPONSE.email)"
    Write-Host "   - Role: $($RESPONSE.role)"
    Write-Host "   - Name: $($RESPONSE.firstName) $($RESPONSE.lastName)"
    Write-Host "   - Request ID: $($RESPONSE.requestId)"
    
    # Test another endpoint
    Write-Host "`n📡 Testing another authenticated endpoint..."
    
    try {
        $SERVICES_RESPONSE = Invoke-RestMethod -Uri "$API_URL/api/services" -Headers @{Authorization="Bearer $FIREBASE_TOKEN"} -Method Get -ErrorVariable servicesError -SkipHttpErrorCheck
        
        # Get status code
        $SERVICES_STATUS_CODE = if ($servicesError) { $servicesError.Exception.Response.StatusCode.value__ } else { 200 }
        
        Write-Host "📊 Status code: $SERVICES_STATUS_CODE"
        
        if ($SERVICES_STATUS_CODE -eq 200) {
            Write-Host "✅ Services endpoint returned $($SERVICES_RESPONSE.Count) services" -ForegroundColor Green
        } else {
            Write-Host "❌ Services endpoint failed" -ForegroundColor Red
            Write-Host "   Error response:"
            Write-Host $SERVICES_RESPONSE
        }
    } catch {
        Write-Host "❌ Services endpoint request failed: $_" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Authentication failed" -ForegroundColor Red
    Write-Host "Error response:"
    Write-Host $RESPONSE
    
    # Additional diagnostics
    Write-Host "`n🔍 Diagnostic information:"
    if ($STATUS_CODE -eq 401) {
        Write-Host "   - 401 Unauthorized: The token is invalid, expired, or missing" -ForegroundColor Yellow
        Write-Host "   - Check that your Firebase token is valid and not expired" -ForegroundColor Yellow
        Write-Host "   - Verify that FIREBASE_PROJECT_ID and other Firebase env vars are correct" -ForegroundColor Yellow
    } elseif ($STATUS_CODE -eq 429) {
        Write-Host "   - 429 Too Many Requests: Rate limiting is active" -ForegroundColor Yellow
        Write-Host "   - The server is throttling requests, wait and try again" -ForegroundColor Yellow
    } elseif ($STATUS_CODE -eq 500) {
        Write-Host "   - 500 Server Error: Check server logs for details" -ForegroundColor Yellow
        Write-Host "   - Verify Firebase Admin SDK initialization in server logs" -ForegroundColor Yellow
    }
    
    # Test server connectivity without auth
    Write-Host "`n📡 Testing server connectivity (no auth)..."
    try {
        $HEALTH_RESPONSE = Invoke-RestMethod -Uri "$API_URL/health" -Method Get -ErrorVariable healthError -SkipHttpErrorCheck
        
        # Get status code
        $HEALTH_STATUS_CODE = if ($healthError) { $healthError.Exception.Response.StatusCode.value__ } else { 200 }
        
        if ($HEALTH_STATUS_CODE -eq 200) {
            Write-Host "✅ Server is reachable" -ForegroundColor Green
        } else {
            Write-Host "❌ Server returned non-200 status: $HEALTH_STATUS_CODE" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Server is unreachable: $_" -ForegroundColor Red
    }
} 