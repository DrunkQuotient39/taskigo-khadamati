# Taskigo Authentication Testing Guide

This guide explains how to test the authentication flow in the Taskigo application, both in development and production environments.

## Prerequisites

- Node.js installed
- Access to a Firebase account with the Taskigo project
- Curl or PowerShell for command-line testing

## Environment Setup

Before testing, ensure your environment variables are correctly set:

### Development Environment

1. Make sure `config.env` contains:
   ```
   FIREBASE_PROJECT_ID=taskigo-5e30d
   FIREBASE_CLIENT_EMAIL=your-service-account-email@taskigo-5e30d.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=your-private-key-with-newlines
   FIREBASE_STORAGE_BUCKET=taskigo-5e30d.appspot.com
   AUTH_DEV_DECODE_FALLBACK=true
   ```

2. For local development without Firebase Admin SDK credentials, set `AUTH_DEV_DECODE_FALLBACK=true`

### Production Environment

1. In Render.com, ensure these environment variables are set:
   ```
   FIREBASE_PROJECT_ID=taskigo-5e30d
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@taskigo-5e30d.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
   FIREBASE_STORAGE_BUCKET=taskigo-5e30d.appspot.com
   AUTH_DEV_DECODE_FALLBACK=false
   ```

2. Make sure `FIREBASE_PRIVATE_KEY` has `\n` for newlines

## Testing Methods

### Method 1: Browser Testing

1. Start the server: `npm run dev`
2. Open the application in your browser
3. Sign in using email/password or Google
4. Check the Network tab in Developer Tools
5. Look for the `/api/auth/me-firebase` request
6. Verify it returns status 200 and user data

### Method 2: Using the Test Scripts

#### Node.js Script

1. Start the server: `npm run dev`
2. Get a Firebase token from the browser console:
   ```javascript
   await window.auth.currentUser.getIdToken()
   ```
3. Copy the token
4. Run the test script:
   ```
   node test-auth-flow.js <your-token>
   ```

#### Bash Script (Linux/Mac)

1. Make the script executable:
   ```
   chmod +x test-auth-curl.sh
   ```
2. Run the script:
   ```
   ./test-auth-curl.sh <your-token>
   ```

#### PowerShell Script (Windows)

1. Run the script:
   ```
   .\test-auth-curl.ps1 <your-token>
   ```

### Method 3: Using Curl Directly

Test the authentication endpoint:

```bash
curl -v -H "Authorization: Bearer <your-token>" http://localhost:5000/api/auth/me-firebase
```

## Troubleshooting

### 401 Unauthorized Errors

- Check that your Firebase token is valid and not expired
- Verify Firebase project ID matches between client and server
- Ensure Firebase Admin SDK is initialized correctly
- Check server logs for detailed error messages

### 429 Too Many Requests

- Rate limiting is active
- Check `RATE_LIMIT_WINDOW_MS` and `RATE_LIMIT_MAX_REQUESTS` settings
- The `/api/auth/me-firebase` endpoint should be excluded from rate limiting

### 500 Server Errors

- Check server logs for Firebase Admin SDK initialization errors
- Verify `FIREBASE_PRIVATE_KEY` format (should have `\n` for newlines)
- Ensure all required environment variables are set

## Logging

The authentication system now includes detailed logging with request IDs:

- Each request gets a unique `requestId` that's included in responses
- Logs include action, status, and relevant context
- System logs are stored in the database for audit trails

## Security Considerations

- In production, always set `AUTH_DEV_DECODE_FALLBACK=false`
- Protect Firebase service account credentials
- Use HTTPS for all API requests in production
- Regularly rotate Firebase service account keys 