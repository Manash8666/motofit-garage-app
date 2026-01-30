# MotoFit Backend - Production Deployment Guide

## ✅ Pre-Deployment Checklist

### Dependencies Verified:
- ✅ `bcryptjs@^2.4.3` - Password hashing
- ✅ `@tidbcloud/serverless@^0.2.0` - TiDB connection
- ✅ `@vercel/node@^5.5.28` - Vercel serverless functions
- ✅ All TypeScript types included

### Configuration Files:
- ✅ `vercel.json` - Optimized routing configuration
- ✅ `.env.production` - Production environment template
- ✅ `.env.example` - Environment template for documentation

## 🚀 Vercel Deployment Steps

### 1. Create New Vercel Project

**Settings:**
- **Repository:** `Manash8666/motofit-garage-app`
- **Root Directory:** `backend`
- **Framework Preset:** Other
- **Build Command:** *Leave empty*
- **Output Directory:** *Leave empty*
- **Install Command:** `npm install`

### 2. Environment Variables

Add these **7 variables** before deploying:

```
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=3Mwtp8sTNYjLWSS.root
TIDB_PASSWORD=5T9wsJGFtTap9F3n
TIDB_DATABASE=test
FRONTEND_URL=https://motofit-garage-app-pgxm.vercel.app
ALLOWED_ORIGINS=https://motofit-garage-app-pgxm.vercel.app,http://localhost:5174,http://localhost:5173
```

**Important:** Select "Production" or "All Environments" for each variable.

### 3. Deploy

Click **"Deploy"** and wait ~2 minutes.

### 4. Test Deployment

Once deployed, test these endpoints (replace `YOUR-BACKEND.vercel.app`):

**Health Check:**
```
https://YOUR-BACKEND.vercel.app/api/health
```
Expected: `{"status":"ok","timestamp":"...","message":"MotoFit API is running"}`

**Environment Check:**
```
https://YOUR-BACKEND.vercel.app/api/debug/env
```
Expected: All `has*` fields should be `true`

**Database Connection:**
```
https://YOUR-BACKEND.vercel.app/api/customers
```
Expected: `[]` (empty array) or list of customers

### 5. Update Frontend

Go to your **frontend** Vercel project and update:

```
VITE_API_URL=https://YOUR-NEW-BACKEND.vercel.app/api
```

Then redeploy frontend.

## 🔍 Troubleshooting

### 500 Error: "Access denied"
- Check TiDB credentials in environment variables
- Ensure no typos or extra spaces
- Verify `TIDB_USER` includes `.root` suffix

### 404 Error: "NOT_FOUND"
- Frontend `VITE_API_URL` is incorrect
- Update frontend env var to point to correct backend URL

### CORS Error
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Redeploy backend after updating

## 📝 Code Changes Made

1. **Added missing dependency:** `bcryptjs` + types
2. **Optimized routing:** Changed `rewrites` to `routes` in `vercel.json`
3. **Added debug endpoint:** `/api/debug/env` for troubleshooting
4. **Updated env templates:** Included production CORS settings

## 🗑️ After Successful Deployment

1. Delete old backend Vercel project
2. Remove debug endpoint from `api/index.ts` (optional)
3. Update `README.md` with new backend URL
