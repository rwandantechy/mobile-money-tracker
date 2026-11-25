# 🚀 Money Tracker Pro - Deployment Guide

## Quick Deployment Setup

### Environment Variables Required:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production
PORT=6000 (or your platform's port)
```

### 1. Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### 2. Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Set environment variables in Railway dashboard
# MONGODB_URI, JWT_SECRET, NODE_ENV

# Deploy
railway up
```

### 3. Render Deployment
1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Build command: `npm install`
4. Start command: `npm start`

### 4. Vercel Deployment

The project includes a Vercel serverless entry point and `vercel.json`. Import
the Git repository into Vercel, or deploy from the repository root with the
Vercel CLI:

```bash
npx vercel
```

Add these environment variables in **Vercel Project Settings → Environment
Variables** (select Production, and Preview too if you use preview deployments):

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
SMTP_EMAIL=your_gmail_address
SMTP_PASS=your_gmail_app_password
NODE_ENV=production
```

`MONGODB_URI` must allow connections from Vercel in your MongoDB Atlas network
access settings. After adding or changing environment variables, redeploy. For
a production deployment, run `npx vercel --prod`.

### Admin access

The admin overview is available at `/admin` and reports aggregated platform
metrics for the last 30 days. Both the page and its API require an authenticated
account whose MongoDB `role` is `admin`; public registration cannot grant this
role. Grant it only to a trusted account using your restricted database
administration workflow. The admin overview does not expose a user directory
or individual merchant records.

### 5. DigitalOcean App Platform
1. Connect your GitHub repository
2. Set environment variables
3. Build command: `npm install`
4. Run command: `npm start`

## CORS Configuration
The app is configured to allow all origins for easy deployment:
- ✅ All origins allowed
- ✅ All HTTP methods supported
- ✅ Credentials enabled
- ✅ Preflight requests handled

## Health Check
Test your deployment with: `https://your-domain.com/health`

## Database Setup
1. Create MongoDB Atlas cluster
2. Get connection string
3. Set as `MONGODB_URI` environment variable

## Security Notes
- Change `JWT_SECRET` in production
- Use HTTPS in production
- Consider rate limiting for production

## Troubleshooting
- Check logs: `heroku logs --tail`
- Verify environment variables
- Test health endpoint
- Check MongoDB connection

## Support
For deployment issues, check:
1. Environment variables
2. Database connection
3. Port configuration
4. CORS settings
