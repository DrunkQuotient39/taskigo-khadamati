#!/bin/bash
# Taskigo Authentication Flow Test Script using curl
# Usage: ./test-auth-curl.sh <firebase-token>

# Check if token is provided
if [ -z "$1" ]; then
  echo "Error: Firebase token is required"
  echo "Usage: ./test-auth-curl.sh <firebase-token>"
  exit 1
fi

# Configuration
API_URL=${API_URL:-"http://localhost:5000"}
FIREBASE_TOKEN=$1

echo "🔍 Starting authentication flow test with curl"
echo "🌐 API URL: $API_URL"
echo "🔑 Firebase token provided: Yes (first 15 chars): ${FIREBASE_TOKEN:0:15}..."

echo -e "\n📡 Testing /api/auth/me-firebase endpoint..."
echo "curl -s -w '\nStatus: %{http_code}' -H 'Authorization: Bearer $FIREBASE_TOKEN' $API_URL/api/auth/me-firebase"

# Make the request and capture both response body and status code
RESPONSE=$(curl -s -w "\nStatus: %{http_code}" -H "Authorization: Bearer $FIREBASE_TOKEN" "$API_URL/api/auth/me-firebase")

# Extract status code from the last line
STATUS_LINE=$(echo "$RESPONSE" | tail -n 1)
STATUS_CODE=$(echo "$STATUS_LINE" | cut -d' ' -f2)

# Extract response body (all lines except the last one)
BODY=$(echo "$RESPONSE" | sed '$d')

echo -e "\n📊 Status code: $STATUS_CODE"

if [ "$STATUS_CODE" -eq 200 ]; then
  echo "✅ Authentication successful!"
  echo "👤 User data:"
  
  # Parse JSON response for key fields (basic parsing, not full JSON parsing)
  ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  EMAIL=$(echo "$BODY" | grep -o '"email":"[^"]*"' | cut -d'"' -f4)
  ROLE=$(echo "$BODY" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
  FIRST_NAME=$(echo "$BODY" | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4)
  LAST_NAME=$(echo "$BODY" | grep -o '"lastName":"[^"]*"' | cut -d'"' -f4)
  REQUEST_ID=$(echo "$BODY" | grep -o '"requestId":"[^"]*"' | cut -d'"' -f4)
  
  echo "   - ID: $ID"
  echo "   - Email: $EMAIL"
  echo "   - Role: $ROLE"
  echo "   - Name: $FIRST_NAME $LAST_NAME"
  echo "   - Request ID: $REQUEST_ID"
  
  # Test another endpoint
  echo -e "\n📡 Testing another authenticated endpoint..."
  SERVICES_RESPONSE=$(curl -s -w "\nStatus: %{http_code}" -H "Authorization: Bearer $FIREBASE_TOKEN" "$API_URL/api/services")
  
  # Extract status code from the last line
  SERVICES_STATUS_LINE=$(echo "$SERVICES_RESPONSE" | tail -n 1)
  SERVICES_STATUS_CODE=$(echo "$SERVICES_STATUS_LINE" | cut -d' ' -f2)
  
  echo "📊 Status code: $SERVICES_STATUS_CODE"
  
  if [ "$SERVICES_STATUS_CODE" -eq 200 ]; then
    # Count array elements (basic approach, not full JSON parsing)
    SERVICES_COUNT=$(echo "$SERVICES_RESPONSE" | grep -o '\{' | wc -l)
    echo "✅ Services endpoint returned approximately $SERVICES_COUNT services"
  else
    echo "❌ Services endpoint failed"
    echo "   Error response:"
    echo "$SERVICES_RESPONSE" | sed '$d'
  fi
else
  echo "❌ Authentication failed"
  echo "Error response:"
  echo "$BODY"
  
  # Additional diagnostics
  echo -e "\n🔍 Diagnostic information:"
  if [ "$STATUS_CODE" -eq 401 ]; then
    echo "   - 401 Unauthorized: The token is invalid, expired, or missing"
    echo "   - Check that your Firebase token is valid and not expired"
    echo "   - Verify that FIREBASE_PROJECT_ID and other Firebase env vars are correct"
  elif [ "$STATUS_CODE" -eq 429 ]; then
    echo "   - 429 Too Many Requests: Rate limiting is active"
    echo "   - The server is throttling requests, wait and try again"
  elif [ "$STATUS_CODE" -eq 500 ]; then
    echo "   - 500 Server Error: Check server logs for details"
    echo "   - Verify Firebase Admin SDK initialization in server logs"
  fi
  
  # Test server connectivity without auth
  echo -e "\n📡 Testing server connectivity (no auth)..."
  HEALTH_RESPONSE=$(curl -s -w "\nStatus: %{http_code}" "$API_URL/health")
  
  # Extract status code from the last line
  HEALTH_STATUS_LINE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
  HEALTH_STATUS_CODE=$(echo "$HEALTH_STATUS_LINE" | cut -d' ' -f2)
  
  if [ "$HEALTH_STATUS_CODE" -eq 200 ]; then
    echo "✅ Server is reachable"
  else
    echo "❌ Server returned non-200 status: $HEALTH_STATUS_CODE"
  fi
fi 