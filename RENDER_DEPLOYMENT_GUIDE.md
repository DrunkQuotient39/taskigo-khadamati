# 🚀 Taskego Deployment Guide - Render (Paid Plan)

This guide will help you deploy Taskego to Render with a paid plan for production-ready performance.

## 📋 Prerequisites

- **GitHub account** with Taskego repository
- **Render account** (https://render.com)
- **Firebase Admin SDK keys** (we still need these)
- **Neon database** (already set up)

## 💰 Render Pricing Plans

### **Starter Plan: $7/month**
- ✅ **Perfect for starting**
- ✅ 750 hours/month
- ✅ 512MB RAM
- ✅ Shared CPU
- ✅ Automatic deployments

### **Standard Plan: $25/month**
- ✅ **Recommended for production**
- ✅ 750 hours/month
- ✅ 1GB RAM
- ✅ Dedicated CPU
- ✅ Better performance

### **Pro Plan: $50/month**
- ✅ **Enterprise ready**
- ✅ 750 hours/month
- ✅ 2GB RAM
- ✅ Dedicated CPU
- ✅ Priority support

## 🚀 Step-by-Step Deployment

### **Step 1: Render Account Setup**
1. **Go to**: https://render.com
2. **Sign up** with GitHub account
3. **Choose plan**: Start with **Starter ($7/month)**
4. **Verify email** and complete setup

### **Step 2: Deploy Backend API**
1. **Click**: "New +" → "Web Service"
2. **Connect GitHub**:
   - Select `FrontendFoundation` repository
   - Choose `main` branch
3. **Configure service**:
   - **Name**: `taskego-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (root)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. **Set Environment Variables** (see below)
5. **Click**: "Create Web Service"

### **Step 3: Deploy Frontend**
1. **Click**: "New +" → "Static Site"
2. **Connect GitHub**:
   - Select `FrontendFoundation` repository
   - Choose `main` branch
3. **Configure service**:
   - **Name**: `taskego-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist/public`
4. **Click**: "Create Static Site"

### **Step 4: Set Environment Variables**
In your backend service, add these variables:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_0zmGLFAVTfD8@ep-late-bird-a2hy8pmq.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Firebase
FIREBASE_PROJECT_ID=taskigo-5e30d
FIREBASE_CLIENT_EMAIL=your-service-account-email@taskigo-5e30d.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour long private key here\n-----END PRIVATE KEY-----
FIREBASE_STORAGE_BUCKET=taskigo-5e30d.firebasestorage.app

# Server
PORT=10000
NODE_ENV=production

# Security (CHANGE THESE!)
JWT_SECRET=your-super-secret-jwt-key-here-change-this
SESSION_SECRET=your-super-secret-session-key-here-change-this

# AI (we'll set this up next)
OLLAMA_BASE_URL=https://your-ollama-server.com
OLLAMA_MODEL=llama3.2:3b-instruct
```

## 🔑 What We Still Need

### **Firebase Admin SDK Keys**
1. **Go to**: Firebase Console → Project Settings → Service Accounts
2. **Click**: "Generate new private key"
3. **Download JSON file**
4. **Give me**:
   - `client_email`
   - `private_key`

### **Ollama Cloud Deployment**
We'll deploy Ollama to a cloud VM for $5-10/month so AI works 24/7.

## 🌐 After Deployment

### **Your URLs will be**:
- **Frontend**: `https://taskego-frontend.onrender.com`
- **Backend**: `https://taskego-backend.onrender.com`
- **API**: `https://taskego-backend.onrender.com/api`

### **Update Frontend Configuration**
The frontend will automatically use the Render backend URL.

## 📊 Performance Expectations

### **Starter Plan ($7/month)**
- **Response time**: 200-500ms
- **Concurrent users**: 10-50
- **Uptime**: 99.9%

### **Standard Plan ($25/month)**
- **Response time**: 100-300ms
- **Concurrent users**: 50-200
- **Uptime**: 99.95%

### **Pro Plan ($50/month)**
- **Response time**: 50-200ms
- **Concurrent users**: 200-1000
- **Uptime**: 99.99%

## 🔄 Next Steps After Deployment

1. **Test the live website**
2. **Deploy Ollama to cloud VM**
3. **Set up custom domain** (optional)
4. **Configure monitoring** (optional)
5. **Set up backups** (optional)

## 💡 Tips for Success

1. **Start with Starter plan** - You can always upgrade
2. **Monitor usage** - Render shows real-time metrics
3. **Set up alerts** - Get notified of issues
4. **Use auto-scaling** - Automatically handle traffic spikes

## 🆘 Need Help?

- **Render Support**: Available in dashboard
- **Documentation**: https://render.com/docs
- **Community**: Render Discord/forums

---

**🎯 Goal**: Get Taskego live on the internet with professional hosting!
