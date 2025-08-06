# 🚀 Deployment Guide

This guide covers deploying the Issue Tracker System to production using free services.

## 📋 Prerequisites

- GitHub repository with your code
- MongoDB Atlas account
- Vercel account (for backend)
- Netlify account (for frontend)

## 🗄️ Database Setup (MongoDB Atlas)

### 1. Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Sign up or log in
3. Create a new project: "Issue Tracker"
4. Click "Build a Database"
5. Choose "M0 Sandbox" (Free tier)
6. Select your preferred region
7. Name your cluster: "issue-tracker-cluster"

### 2. Configure Database Access

1. Go to "Database Access" in the sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create username and secure password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 3. Configure Network Access

1. Go to "Network Access" in the sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, restrict to specific IPs
4. Click "Confirm"

### 4. Get Connection String

1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Select "Node.js" and version "4.1 or later"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with "issue-tracker"

Example:
```
mongodb+srv://username:password@issue-tracker-cluster.abc123.mongodb.net/issue-tracker?retryWrites=true&w=majority
```

## 🖥️ Backend Deployment (Vercel)

### 1. Prepare Backend for Deployment

Ensure your `backend/package.json` has the correct scripts:
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts"
  }
}
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/issue-tracker
JWT_SECRET=your-super-secret-production-jwt-key-256-bits
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend-domain.netlify.app
```

### 4. Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Note your backend URL (e.g., `https://your-backend.vercel.app`)

## 🌐 Frontend Deployment (Netlify)

### 1. Prepare Frontend for Deployment

Create `client/.env.production`:
```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SOCKET_URL=https://your-backend.vercel.app
```

### 2. Deploy to Netlify

1. Go to [Netlify](https://netlify.com)
2. Sign up/login with GitHub
3. Click "New site from Git"
4. Choose GitHub and select your repository
5. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`

### 3. Set Environment Variables

In Netlify dashboard → Site settings → Environment variables, add:

```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_SOCKET_URL=https://your-backend.vercel.app
```

### 4. Configure Redirects

Netlify should automatically use the `client/netlify.toml` file for SPA redirects.

### 5. Deploy

1. Click "Deploy site"
2. Wait for build to complete
3. Note your frontend URL (e.g., `https://your-app.netlify.app`)

## 🔄 Update Backend CORS

After frontend deployment, update your backend environment variables:

In Vercel → Settings → Environment Variables:
```env
CLIENT_URL=https://your-app.netlify.app
```

Redeploy the backend for changes to take effect.

## ✅ Verification

### 1. Test Backend

Visit `https://your-backend.vercel.app/health` - should return:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Test Frontend

1. Visit your Netlify URL
2. Try registering a new account
3. Create a test issue
4. Verify real-time updates work

### 3. Test Real-time Features

1. Open the app in two browser tabs
2. Create an issue in one tab
3. Verify it appears in the other tab immediately

## 🔧 Troubleshooting

### Common Issues

**Backend not starting:**
- Check Vercel function logs
- Verify environment variables
- Ensure MongoDB connection string is correct

**Frontend build fails:**
- Check build logs in Netlify
- Verify environment variables
- Ensure all dependencies are in package.json

**CORS errors:**
- Verify CLIENT_URL in backend environment
- Check that both URLs use HTTPS in production

**Socket.IO connection fails:**
- Ensure VITE_SOCKET_URL points to backend
- Check that WebSocket connections are allowed

**Database connection fails:**
- Verify MongoDB Atlas network access settings
- Check connection string format
- Ensure database user has correct permissions

### Debugging Steps

1. **Check logs:**
   - Vercel: Functions → View Function Logs
   - Netlify: Deploys → Build Logs

2. **Test API endpoints:**
   ```bash
   curl https://your-backend.vercel.app/health
   ```

3. **Verify environment variables:**
   - Both platforms show current env vars in settings

## 🔄 Continuous Deployment

Both Vercel and Netlify automatically deploy when you push to your main branch:

1. Make changes locally
2. Commit and push to GitHub
3. Both services automatically build and deploy
4. Check deployment status in respective dashboards

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor function performance
- Track error rates

### Netlify Analytics
- Enable in Netlify dashboard
- Monitor site performance
- Track user engagement

### MongoDB Atlas Monitoring
- Monitor database performance
- Set up alerts for high usage
- Track connection metrics

## 🔒 Security Considerations

### Production Checklist

- [ ] Use strong JWT secret (256+ bits)
- [ ] Enable HTTPS everywhere
- [ ] Restrict MongoDB network access
- [ ] Use strong database passwords
- [ ] Enable rate limiting
- [ ] Set secure CORS origins
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated

### Environment Variables Security

Never commit these to version control:
- Database connection strings
- JWT secrets
- API keys
- Passwords

## 💰 Cost Considerations

All services used have generous free tiers:

**MongoDB Atlas:**
- 512MB storage (M0 Sandbox)
- Shared RAM and vCPU
- No backup/restore

**Vercel:**
- 100GB bandwidth/month
- 10GB storage
- 12 serverless functions

**Netlify:**
- 100GB bandwidth/month
- 300 build minutes/month
- Deploy previews

## 🚀 Scaling Up

When you outgrow free tiers:

**Database:**
- Upgrade to M2/M5 clusters
- Enable backups
- Add read replicas

**Backend:**
- Upgrade Vercel plan for more functions
- Consider dedicated servers for heavy loads

**Frontend:**
- Upgrade Netlify for more bandwidth
- Add CDN for global performance

---

**Your Issue Tracker is now live! 🎉**

Remember to monitor your deployments and keep your dependencies updated for security and performance.