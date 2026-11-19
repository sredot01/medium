# 🚀 TechBlog Deployment Guide
## Frontend on Netlify + Backend on Render

This guide will help you deploy your TechBlog application for FREE!

---

## 📋 Prerequisites

- GitHub account
- Netlify account (free) - [Sign up here](https://app.netlify.com/signup)
- Render account (free) - [Sign up here](https://dashboard.render.com/register)
- Your code pushed to a GitHub repository

---

## 🔧 Part 1: Deploy Backend to Render (Do This First!)

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** if you haven't already:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - TechBlog"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

### Step 2: Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `techblog-backend`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
   - **Plan**: `Free`

5. **Add Environment Variables** (click "Advanced"):
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `your-super-secret-random-string-change-this`
   - `PORT` = `5000`
   - `FRONTEND_URL` = (leave empty for now, we'll add after Netlify deployment)

6. Click **"Create Web Service"**

7. **Wait for deployment** (5-10 minutes)

8. **Copy your backend URL**: 
   - It will be something like: `https://techblog-backend.onrender.com`
   - **IMPORTANT**: Save this URL, you'll need it for the frontend!

9. **Test your backend**:
   - Open: `https://YOUR-BACKEND-URL.onrender.com/api/health`
   - You should see: `{"status":"OK","message":"TechBlog API is running"}`

---

## 🎨 Part 2: Deploy Frontend to Netlify

### Step 1: Update Frontend Configuration

1. **Create environment file** in your frontend folder:
   ```bash
   cd frontend
   ```

2. **Create `.env.production`**:
   ```env
   REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```
   ⚠️ **Replace `YOUR-BACKEND-URL` with your actual Render URL from Part 1!**

3. **Commit this change**:
   ```bash
   git add .
   git commit -m "Add production environment config"
   git push
   ```

### Step 2: Deploy to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Select your repository
5. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/build`
6. Click **"Deploy site"**

### Step 3: Configure Site Settings

1. **Site name**: 
   - Go to **Site settings** → **Change site name**
   - Choose something like: `techblog-yourname`

2. **Environment Variables**:
   - Go to **Site settings** → **Build & deploy** → **Environment variables**
   - Add: `REACT_APP_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`

3. **Trigger new deployment**:
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**

---

## 🔗 Part 3: Connect Frontend and Backend

### Update Backend CORS Settings

1. Go back to **Render Dashboard**
2. Open your backend service
3. Go to **Environment** tab
4. Add/Update environment variable:
   - `FRONTEND_URL` = `https://YOUR-SITE-NAME.netlify.app`
   - (Replace with your actual Netlify URL)
5. Save changes (this will redeploy your backend)

---

## ✅ Part 4: Test Your Deployment

### Test Backend
```bash
curl https://YOUR-BACKEND-URL.onrender.com/api/health
```

### Test Frontend
1. Open: `https://YOUR-SITE-NAME.netlify.app`
2. Try to sign up / log in
3. Create a post
4. Test all features!

---

## 🐛 Troubleshooting

### Issue: CORS Errors
**Solution**: Make sure `FRONTEND_URL` in Render matches your Netlify URL exactly

### Issue: API calls failing
**Solution**: 
1. Check `REACT_APP_API_URL` in Netlify environment variables
2. Make sure it includes `/api` at the end
3. Check browser console for exact error

### Issue: Backend not responding
**Solution**:
1. Check Render logs: Go to your service → "Logs" tab
2. Make sure the service is running (not sleeping)
3. Free tier sleeps after 15 minutes of inactivity - first request will be slow

### Issue: Database not persisting
**Solution**: Render free tier doesn't guarantee disk persistence. For production, consider:
- Upgrading to paid Render plan ($7/mo)
- Using external database (PostgreSQL on Render or Supabase)

---

## 📊 Monitoring Your App

### Backend Monitoring (Render)
- **Logs**: Dashboard → Your Service → Logs
- **Metrics**: Dashboard → Your Service → Metrics
- **Health Check**: `https://YOUR-BACKEND-URL.onrender.com/api/health`

### Frontend Monitoring (Netlify)
- **Deploy Logs**: Site Overview → Deploys → Click any deploy
- **Analytics**: Available with paid plans

---

## 🔄 Updating Your App

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push
```
Render will auto-deploy!

### Update Frontend
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push
```
Netlify will auto-deploy!

---

## 💰 Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Render | Free | $0/month |
| Netlify | Free | $0/month |
| **Total** | | **$0/month** |

**Limitations**:
- Render: Backend sleeps after 15 min inactivity
- Render: 750 hours/month free (plenty for one app)
- Netlify: 100GB bandwidth/month
- Netlify: 300 build minutes/month

---

## 🚀 Optional: Custom Domain

### Netlify (Frontend)
1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration steps

### Render (Backend)
1. Not needed - frontend calls backend via API
2. If desired: Go to Settings → Custom Domain

---

## 📝 Important Notes

1. **Free Tier Sleep**: Render free tier sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

2. **Environment Variables**: Never commit `.env` files! Always use platform environment variables.

3. **Database**: SQLite data may not persist on Render free tier. Consider PostgreSQL for production.

4. **Security**: Change `JWT_SECRET` to a strong random string in production!

---

## 🎉 You're Done!

Your TechBlog is now live and accessible worldwide! 

- **Frontend**: `https://YOUR-SITE-NAME.netlify.app`
- **Backend**: `https://YOUR-BACKEND-URL.onrender.com`

Share your app with the world! 🌍

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com
- Check the logs first!
- Look for error messages in browser console (F12)

