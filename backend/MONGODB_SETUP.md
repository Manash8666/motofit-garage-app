# MongoDB Setup for MotoFit Backend

## Option 1: Install MongoDB on Windows (Recommended)

1. **Download MongoDB Community Server**:
   - Visit: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Click: Download

2. **Install**:
   - Run the installer
   - Choose "Complete" installation
   - Check "Install MongoDB as a Service"
   - Start MongoDB service automatically

3. **Verify Installation**:
   ```powershell
   mongod --version
   ```

## Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. **Create Account**: https://www.mongodb.com/cloud/atlas
2. **Create Free Cluster** (M0 - 512MB storage)
3. **Get Connection String**
4. **Update `.env`**:
   ```env
   DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/motofit
   ```

## Option 3: Docker Desktop (If Installed)

If you have Docker Desktop installed on Windows:

```powershell
docker run -d -p 27017:27017 --name motofit-mongodb mongo:latest
```

## After MongoDB is Running

1. The backend will automatically connect to `mongodb://localhost:27017/motofit`
2. Parse Server will create the database and collections automatically
3. No manual database setup needed!
