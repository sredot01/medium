# 🔐 Environment Variables Setup Guide

## 📝 Local Development Setup

### Backend Environment Variables

Create `backend/.env` file:

```env
# Server Port
PORT=5000

# JWT Secret (Generate a strong secret for production)
JWT_SECRET=techblog-super-secret-jwt-key-please-change-in-production-2024

# Node Environment
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
# API URL for local development
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🚀 Production Setup

### Render (Backend) Environment Variables

Add these in Render Dashboard → Environment:

```
NODE_ENV=production
PORT=5000
JWT_SECRET=<generate-a-strong-random-string-here>
FRONTEND_URL=https://your-app-name.netlify.app
```

**To generate a secure JWT_SECRET:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Use online generator
# Visit: https://randomkeygen.com/
```

### Netlify (Frontend) Environment Variables

Add these in Netlify Dashboard → Site settings → Environment variables:

```
REACT_APP_API_URL=https://your-backend-name.onrender.com/api
```

**Important**: Replace `your-backend-name` with your actual Render backend URL!

---

## 🔄 Connecting Frontend and Backend

### Step 1: Deploy Backend First
1. Deploy to Render
2. Copy your backend URL: `https://your-backend-name.onrender.com`

### Step 2: Update Frontend Environment
1. In Netlify, set `REACT_APP_API_URL` to:
   ```
   https://your-backend-name.onrender.com/api
   ```
   ⚠️ Don't forget the `/api` at the end!

### Step 3: Update Backend CORS
1. In Render, set `FRONTEND_URL` to:
   ```
   https://your-app-name.netlify.app
   ```
   ⚠️ No trailing slash!

### Step 4: Redeploy Both
- Render will auto-redeploy when you save environment variables
- Netlify: Trigger a new deploy manually

---

## ✅ Verify Configuration

### Check Backend
```bash
curl https://your-backend-name.onrender.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "TechBlog API is running",
  "timestamp": "2024-..."
}
```

### Check Frontend
1. Open: `https://your-app-name.netlify.app`
2. Open browser console (F12)
3. Try to sign up/log in
4. Check for CORS errors

---

## 🐛 Troubleshooting

### CORS Error
**Problem**: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution**: 
1. Check `FRONTEND_URL` in Render matches your Netlify URL exactly
2. Make sure there's no trailing slash
3. Wait for Render to redeploy after changing env vars

### API Calls Failing
**Problem**: Network errors, 404s

**Solution**:
1. Check `REACT_APP_API_URL` in Netlify
2. Make sure it includes `/api` at the end
3. Test backend health endpoint directly
4. Check browser network tab for exact error

### Environment Variables Not Working
**Problem**: Changes not taking effect

**Solution**:
1. **Netlify**: Trigger a new deploy after changing env vars
2. **Render**: Service auto-redeploys, wait 2-3 minutes
3. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 🔒 Security Best Practices

1. ✅ **Never commit `.env` files** to Git
2. ✅ **Use strong random strings** for JWT_SECRET (64+ characters)
3. ✅ **Different secrets** for development and production
4. ✅ **Rotate secrets** periodically (every 90 days)
5. ✅ **Limit CORS origins** to known domains only

---

## 📋 Environment Variables Checklist

### Local Development
- [ ] `backend/.env` created with PORT, JWT_SECRET, FRONTEND_URL
- [ ] `frontend/.env` created with REACT_APP_API_URL
- [ ] Both apps running locally
- [ ] Can sign up/log in

### Production (Render)
- [ ] NODE_ENV = production
- [ ] PORT = 5000
- [ ] JWT_SECRET = (strong random string)
- [ ] FRONTEND_URL = (your Netlify URL)
- [ ] Backend health check working

### Production (Netlify)
- [ ] REACT_APP_API_URL = (your Render URL + /api)
- [ ] Frontend deployed successfully
- [ ] Can access the site
- [ ] No CORS errors

---

## 🆘 Need Help?

If you're stuck:
1. Check browser console (F12) for errors
2. Check Render logs (Dashboard → Your Service → Logs)
3. Verify all environment variables are set correctly
4. Make sure URLs don't have typos
5. Test backend health endpoint first

---

## 📚 Related Files

- `DEPLOYMENT_GUIDE.md` - Full deployment instructions
- `QUICK_DEPLOY.md` - 30-minute deployment checklist
- `.gitignore` - Protects your secrets
- `netlify.toml` - Netlify configuration
- `render.yaml` - Render configuration

