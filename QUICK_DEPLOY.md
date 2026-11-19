# ⚡ Quick Deployment Checklist

## 📝 Pre-Deployment Checklist

- [ ] Code is working locally
- [ ] All tests pass
- [ ] Code is pushed to GitHub
- [ ] You have accounts on Render and Netlify

---

## 🚀 Deployment Steps (30 minutes)

### 1️⃣ Deploy Backend (15 min)

1. [ ] Go to [Render Dashboard](https://dashboard.render.com/)
2. [ ] Create New Web Service
3. [ ] Connect GitHub repo
4. [ ] Settings:
   - Build: `cd backend && npm install`
   - Start: `cd backend && node server.js`
   - Plan: Free
5. [ ] Add environment variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-here
   PORT=5000
   ```
6. [ ] Deploy and wait (~10 min)
7. [ ] **Copy backend URL**: `https://______.onrender.com`
8. [ ] Test: Open `https://YOUR-URL.onrender.com/api/health`

---

### 2️⃣ Deploy Frontend (10 min)

1. [ ] Create `frontend/.env.production`:
   ```env
   REACT_APP_API_URL=https://YOUR-BACKEND-URL.onrender.com/api
   ```

2. [ ] Commit and push:
   ```bash
   git add .
   git commit -m "Add production config"
   git push
   ```

3. [ ] Go to [Netlify Dashboard](https://app.netlify.com/)
4. [ ] Import from GitHub
5. [ ] Settings:
   - Base: `frontend`
   - Build: `npm run build`
   - Publish: `frontend/build`
6. [ ] Add environment variable:
   - `REACT_APP_API_URL` = `https://YOUR-BACKEND-URL.onrender.com/api`
7. [ ] Deploy
8. [ ] **Copy frontend URL**: `https://______.netlify.app`

---

### 3️⃣ Connect Them (2 min)

1. [ ] Go back to Render
2. [ ] Add environment variable:
   - `FRONTEND_URL` = `https://YOUR-SITE.netlify.app`
3. [ ] Save (auto-redeploys)

---

## ✅ Test Your Live App

- [ ] Open your Netlify URL
- [ ] Sign up / Log in
- [ ] Create a post
- [ ] Test all features

---

## 🎉 Done!

Your app is LIVE! Share it with the world:
- Frontend: `https://YOUR-SITE.netlify.app`
- Backend: `https://YOUR-BACKEND.onrender.com`

---

## ⚠️ Common Issues

**CORS Error?**
→ Check `FRONTEND_URL` in Render matches Netlify URL

**API not working?**
→ Check `REACT_APP_API_URL` in Netlify env vars

**Backend slow?**
→ Normal! Free tier sleeps. First request takes 30-60s

---

## 📚 Full Guide

See `DEPLOYMENT_GUIDE.md` for detailed instructions!

