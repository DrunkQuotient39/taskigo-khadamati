# Taskigo Deployment Guide

This document provides a comprehensive guide to deploy the Taskigo (Khadamati) service marketplace platform. Follow these steps to successfully deploy both frontend and backend components.

## Prerequisites

Before deployment, ensure you have the following:

1. **Firebase Project** with Authentication enabled
2. **Neon.tech PostgreSQL Database** account 
3. **Render.com Account** for web service deployment
4. **DigitalOcean Account** for Ollama AI deployment (optional)
5. **Node.js v18+** for local testing

## Environment Variables

### Backend (.env file)

Create a `.env` file in the project root with the following variables:

```
# Core Configuration
PORT=5000
NODE_ENV=production
DATABASE_URL=<your-neon-postgres-connection-string>
FRONTEND_URL=https://your-frontend-url.com
ALLOWED_ORIGINS=https://your-custom-domain.com

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour long private key here...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com

# Ollama Configuration
OLLAMA_BASE_URL=https://your-ollama-instance-url
OLLAMA_MODEL=qwen2:7b-instruct

# Optional: OpenAI fallback (if Ollama is unavailable)
# OPENAI_API_KEY=your-openai-api-key

# Security
JWT_SECRET=create-a-secure-random-string
COOKIE_SECRET=another-secure-random-string

# For emails (optional)
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=your-email@example.com
# SMTP_PASS=your-email-password
```

### Frontend (.env file)

Create a `.env` file in the client directory with:

```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Deployment Steps

### 1. Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use an existing one)
3. Add Authentication with Email/Password and Google providers
4. Add your deployment domains to the Authorized Domains in Authentication settings
5. Generate a new Private Key in Project Settings > Service Accounts > Firebase Admin SDK
6. Copy the generated JSON credentials for your environment variables

### 2. Database Setup (Neon.tech)

1. Create an account on [Neon.tech](https://neon.tech)
2. Create a new PostgreSQL database
3. Copy the connection string (found under Connection Details)
4. Set this as your DATABASE_URL environment variable

### 3. Backend Deployment (Render.com)

1. Login to [Render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the following configuration:
   - **Name**: taskigo-backend (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Environment Variables**: Add all the variables from the backend .env file
5. Click "Create Web Service"

### 4. Frontend Deployment (Render.com)

1. Create another Web Service in Render
2. Connect to the same GitHub repository
3. Set the following configuration:
   - **Name**: taskigo-frontend (or your preferred name)
   - **Environment**: Static Site
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Environment Variables**: Add all the variables from the frontend .env file
4. Click "Create Web Service"

### 5. Ollama AI Deployment (DigitalOcean)

1. Create a DigitalOcean Droplet (minimum 4GB RAM / 2vCPUs)
2. SSH into your droplet
3. Install Docker and Docker Compose:
   ```
   apt update && apt install -y docker.io docker-compose
   ```
4. Create a docker-compose.yml file:
   ```yaml
   version: '3'
   services:
     ollama:
       image: ollama/ollama:latest
       ports:
         - "11434:11434"
       volumes:
         - ./ollama_data:/root/.ollama
       restart: unless-stopped
       deploy:
         resources:
           limits:
             memory: 3.5G
   ```
5. Start the Ollama service:
   ```
   docker-compose up -d
   ```
6. Pull a smaller model that fits in memory:
   ```
   docker exec -it $(docker ps -q --filter ancestor=ollama/ollama) ollama pull qwen2:7b-instruct
   ```
7. Set up Nginx as a reverse proxy with HTTPS (recommended)
8. Update your OLLAMA_BASE_URL environment variable with your Ollama server URL

### 6. Custom Domain Setup

1. Purchase a domain (if you don't have one)
2. In your domain registrar, add the following DNS records:
   - A record: `@` pointing to your Render static site IP
   - CNAME record: `api` pointing to your Render backend URL
3. In Render.com, go to each service settings and add your custom domain

### 7. Post-Deployment Steps

1. Access the admin panel at `https://yourdomain.com/admin`
2. Log in with the admin credentials: `taskigo.khadamati@gmail.com` / `Taskigo@12345A`
3. Generate test data using the "Generate Test Data" button in the admin panel
4. Verify all features are working properly

## Troubleshooting

### Database Connection Issues

If your backend can't connect to the database:

1. Verify your DATABASE_URL is correct with the right format
2. Ensure you've whitelisted Render IPs in Neon.tech
3. Check that your database user has proper permissions

### Firebase Authentication Issues

If users can't log in:

1. Make sure you've added all domains to Firebase Authorized Domains
2. Check that environment variables are correct
3. Verify that Email/Password authentication is enabled

### CORS Errors

If you see CORS errors in the browser console:

1. Verify ALLOWED_ORIGINS environment variable contains your frontend domain
2. Check that FRONTEND_URL is set correctly
3. Make sure the backend is accessible from the frontend

### AI Chat Not Working

If the AI chat is not responding:

1. Check that your Ollama instance is running properly
2. Verify OLLAMA_BASE_URL is set correctly and accessible
3. Make sure the model specified in OLLAMA_MODEL exists on your server
4. If using a small server, consider adding swap space:
   ```
   sudo fallocate -l 4G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

## Maintenance

### Regular Backups

Set up regular database backups through Neon.tech's backup feature.

### Monitoring

Consider setting up monitoring with services like:
- Render's built-in logs and metrics
- Sentry for error tracking
- Uptime Robot for service monitoring

### Updates

Keep dependencies updated by periodically reviewing and updating package.json files.

## Support

For additional assistance, contact the development team or refer to the project documentation.
