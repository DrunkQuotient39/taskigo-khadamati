# Environment Variables Guide for Taskigo

This guide explains all the environment variables required for the Taskigo platform, their purpose, and how to obtain the necessary values.

## Backend Environment Variables

Create a `.env` file in the project root directory with the following variables:

### Core Configuration

| Variable | Description | How to Obtain | Example |
|----------|-------------|---------------|---------|
| `PORT` | The port the server will run on | Choose any available port | `5000` |
| `NODE_ENV` | Environment mode (development/production) | Set based on environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | Neon.tech dashboard | `postgresql://user:password@host/database` |
| `FRONTEND_URL` | URL of the frontend application | Your deployment URL | `https://taskigo.net` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed origins | Your domain names | `https://taskigo.net,https://www.taskigo.net` |

### Firebase Configuration

| Variable | Description | How to Obtain | Example |
|----------|-------------|---------------|---------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console > Project settings | `taskigo-5e30d` |
| `FIREBASE_PRIVATE_KEY` | Private key for Firebase Admin SDK | Firebase Console > Project Settings > Service Accounts > Generate new private key | `-----BEGIN PRIVATE KEY-----\nXXXX...` |
| `FIREBASE_CLIENT_EMAIL` | Client email for Firebase Admin SDK | Found in the generated JSON from Firebase | `firebase-adminsdk-fbsvc@taskigo-5e30d.iam.gserviceaccount.com` |

### AI Configuration

| Variable | Description | How to Obtain | Example |
|----------|-------------|---------------|---------|
| `OLLAMA_BASE_URL` | URL for the Ollama API | Your Ollama server address | `https://ollama.taskigo.net` |
| `OLLAMA_MODEL` | Name of the Ollama model to use | Available on your Ollama server | `qwen2:7b-instruct` |
| `OPENAI_API_KEY` | OpenAI API key (optional backup) | OpenAI dashboard | `sk-...` |

### Security

| Variable | Description | How to Obtain | Example |
|----------|-------------|---------------|---------|
| `JWT_SECRET` | Secret for JWT token signing | Generate a secure random string | `30-50 character random string` |
| `COOKIE_SECRET` | Secret for cookie signing | Generate a secure random string | `30-50 character random string` |

### Optional: Email Configuration

| Variable | Description | How to Obtain | Example |
|----------|-------------|---------------|---------|
| `SMTP_HOST` | SMTP server hostname | Email provider | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | Email provider | `587` |
| `SMTP_USER` | SMTP username | Email provider | `taskigo.khadamati@gmail.com` |
| `SMTP_PASS` | SMTP password | Email provider | `your-email-password` |

## Frontend Environment Variables

Create a `.env` file in the `client` directory with the following variables:

### API Configuration

| Variable | Description | How to Obtain | Example |
|----------|-------------|---------------|---------|
| `VITE_API_URL` | URL of the backend API | Your backend deployment URL | `https://api.taskigo.net` |

### Firebase Configuration

| Variable | Description | How to Obtain | Example |
|----------|-------------|---------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase Web SDK API key | Firebase Console > Project settings > Web app configuration | `AIzaSyADQtywHCVJSa4wyT9-2MLK-AMNeiiDTfA` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase authentication domain | Firebase Console | `taskigo-5e30d.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | Firebase Console | `taskigo-5e30d` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Firebase Console | `taskigo-5e30d.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | Firebase Console | `711846238759` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | Firebase Console | `1:711846238759:web:6c4b77a8d3e0f199740c02` |

## How to Obtain Key Values

### Firebase Admin SDK Private Key

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon > Project settings > Service accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract the `private_key` field from the JSON file
7. Make sure to include the whole key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
8. When adding to `.env`, replace actual newlines with `\n` characters

Example:
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCg7mwLMnvj4/BV\n0j5duIPAwchJyO5wsBJD5XbMFEUnewi+qv8oHd+QyB3ygVcBxtKg5EqM1NSqdCix\n2pW7bHvREWIiMm4DfU8/AyplDRDEAU7GM6UFNw2Cugvx/2ZHBYmuiHxSMu1+BRBq\njyQYYMDhKfXnv/k+1Ol1yryIBpzDiz2ioeZ800fNPOnp7fwMcy2t7170AmKAknhG\n-----END PRIVATE KEY-----\n"
```

### Neon PostgreSQL Connection String

1. Log in to [Neon.tech](https://neon.tech)
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string that looks like: `postgresql://neondb_owner:password@ep-something.region.aws.neon.tech/neondb?sslmode=require`

### Generating Secure Random Strings

For `JWT_SECRET` and `COOKIE_SECRET`, you need secure random strings. You can generate them using:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Firebase Web SDK Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Add a web app if you haven't already (click the web icon </> on the Project Overview page)
4. The configuration object will be shown, containing all the needed values

## Setting Environment Variables in Render.com

1. Go to the Render Dashboard
2. Select your web service
3. Go to "Environment" tab
4. Add each key-value pair from your `.env` file
5. Click "Save Changes"

## Setting Environment Variables in Development

For local development:
1. Create `.env` files in the project root and client directory
2. Add the necessary variables as described above
3. Use the `dotenv` package which is already included in the project

## Important Notes

- **Never commit your `.env` files to version control**
- For PostgreSQL connection strings with special characters, ensure they are properly escaped
- In PowerShell, you may need to use the following syntax for multiline values:
  ```
  $env:FIREBASE_PRIVATE_KEY = @"
  -----BEGIN PRIVATE KEY-----
  MIIEvAIBADANBgkqhkiG9w0BAQEFAASC...
  -----END PRIVATE KEY-----
  "@
  ```
- For Windows Command Prompt, you may need to use `^` for line continuation
- If using Docker, pass environment variables using the `-e` flag or a `docker-compose.yml` file

## Testing Your Configuration

After setting up all environment variables, you can test your configuration by:

1. Starting the backend server: `npm run start:dev`
2. Starting the frontend development server: `cd client && npm run dev`
3. Check the server logs for any environment-related errors
4. Test the authentication flow to verify Firebase configuration
5. Test the AI chat to verify Ollama configuration

If you encounter issues, verify that all environment variables are set correctly and accessible to the application.