# GitHub Deployment Guide for Taskego

## Step 1: Initialize Git Repository

In your Replit console, run these commands:

```bash
# Initialize git repository
git init

# Add all files to git
git add .

# Create initial commit
git commit -m "Initial commit: Complete Taskego service marketplace with AI features"
```

## Step 2: Create GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the "+" icon in the top right corner
3. Select "New repository"
4. Name it: `taskego-service-marketplace`
5. Add description: "Bilingual AI-powered service marketplace with React frontend, Express backend, and comprehensive enterprise features"
6. Keep it **Public** (or Private if preferred)
7. **Do NOT** initialize with README, .gitignore, or license (we already have these)
8. Click "Create repository"

## Step 3: Connect Local Repository to GitHub

Copy the commands from GitHub's "push an existing repository" section:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/taskego-service-marketplace.git

# Rename main branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 4: Set Up Environment Variables for Deployment

Create a `.env.example` file for documentation:

```bash
# Copy your current .env to create example
cp .env .env.example
```

Then edit `.env.example` to remove actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskego"

# Authentication  
JWT_SECRET="your-jwt-secret-key"

# AI Features
OPENAI_API_KEY="your-openai-api-key"

# Payment Processing
STRIPE_SECRET_KEY="your-stripe-secret-key"

# SMS Notifications
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"

# File Uploads
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

## Step 5: Deployment Options

### Option A: Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your `taskego-service-marketplace` repository
5. Railway will auto-detect it's a Node.js project
6. Add environment variables in Railway dashboard
7. Your app will be deployed with a custom URL

### Option B: Deploy to Render

1. Go to [Render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18
6. Add environment variables
7. Deploy

### Option C: Deploy to Vercel (Frontend + Serverless Backend)

1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will auto-detect the framework
4. Add environment variables
5. Deploy

## Step 6: Database Setup for Production

### Using Neon (PostgreSQL)

1. Go to [Neon.tech](https://neon.tech)
2. Create account and new project
3. Get your connection string
4. Update `DATABASE_URL` in your deployment platform
5. Run migrations: `npm run db:push`

### Using Supabase (PostgreSQL)

1. Go to [Supabase.com](https://supabase.com)
2. Create new project
3. Get database URL from Settings > Database
4. Update environment variables
5. Run migrations

## Step 7: Domain Setup (Optional)

1. Purchase domain from any registrar
2. In your deployment platform (Railway/Render/Vercel):
   - Go to Settings > Domains
   - Add your custom domain
   - Update DNS records as instructed

## Step 8: Monitoring and Analytics

### Set Up Error Tracking

Add Sentry for error monitoring:

```bash
npm install @sentry/node @sentry/react
```

### Set Up Analytics

Add analytics to track usage:
- Google Analytics
- Mixpanel
- PostHog

## Step 9: CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Build project
      run: npm run build
      
    - name: Deploy to Railway
      run: |
        # Add your deployment commands here
        echo "Deploying to production..."
```

## Step 10: Security Checklist

- [ ] All API keys are in environment variables
- [ ] `.env` file is in `.gitignore`
- [ ] Database has proper access controls
- [ ] HTTPS is enabled on your domain
- [ ] Rate limiting is configured
- [ ] Input validation is implemented
- [ ] CORS is properly configured

## Post-Deployment Steps

1. **Test all features**:
   - User registration/login
   - Service browsing
   - Booking system
   - Payment processing
   - AI chatbot
   - Admin panel

2. **Set up monitoring**:
   - Uptime monitoring (UptimeRobot)
   - Error tracking (Sentry)
   - Performance monitoring (New Relic)

3. **Create documentation**:
   - API documentation
   - User guide
   - Admin manual

## Useful Commands

```bash
# Check git status
git status

# Add specific files
git add filename.js

# Commit changes
git commit -m "Add new feature"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# Check deployment logs
railway logs  # for Railway
render logs   # for Render
vercel logs   # for Vercel
```

## Troubleshooting

### Common Issues:

1. **Build fails**: Check Node.js version compatibility
2. **Database connection error**: Verify DATABASE_URL format
3. **Environment variables not loading**: Ensure they're set in deployment platform
4. **API keys not working**: Check if keys are properly configured
5. **CORS errors**: Update CORS configuration for production domain

### Getting Help:

- Check deployment platform documentation
- Review server logs for errors
- Test API endpoints individually
- Verify environment variables are set correctly

## Success! 🚀

Your Taskego service marketplace is now deployed and ready for users. The app includes:

- ✅ Bilingual AI-powered service marketplace
- ✅ Secure payment processing with Stripe
- ✅ Real-time WebSocket features
- ✅ Comprehensive admin dashboard
- ✅ Mobile-responsive design
- ✅ Enterprise-level security
- ✅ Full API documentation

Share your deployed URL and start onboarding users!