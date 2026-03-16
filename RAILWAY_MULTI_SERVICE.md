# Railway Multi-Service Setup Guide

## 🎯 Multi-Service Architecture

Railway supports multi-service deployments similar to Docker Compose:

### Services:
1. **PostgreSQL Database** - Managed by Railway
2. **Backend API** - Spring Boot application  
3. **Frontend** - Next.js application

## 🚀 Deployment Steps

### 1. Deploy Backend Service
- Repository: `backend/` directory
- Dockerfile: `backend/Dockerfile`
- Health Check: `/health`
- Environment: Auto-configured for PostgreSQL

### 2. Add PostgreSQL Service
- Type: PostgreSQL
- Plan: Free tier
- Auto-connects to backend

### 3. Deploy Frontend Service  
- Repository: `frontend/` directory
- Dockerfile: `frontend/Dockerfile`
- Health Check: `/`
- Environment: Auto-connects to backend

## 🔧 Configuration Files

### Backend (`backend/railway.toml`)
- Uses Railway's PostgreSQL variables
- Health check path: `/health`
- Production profile enabled

### Frontend (`frontend/railway.toml`)
- Auto-connects to backend URL
- Production environment
- Port 3000

## 📊 Service Communication

Railway automatically provides:
- `${{Postgres.PGHOST}}` - Database host
- `${{Postgres.PGPORT}}` - Database port  
- `${{Postgres.PGDATABASE}}` - Database name
- `${{backend.URL}}` - Backend URL for frontend

## 🎯 Benefits vs Docker Compose

✅ **Same architecture** - Multi-service setup
✅ **Managed database** - Railway handles PostgreSQL
✅ **Auto-scaling** - Individual service scaling
✅ **Environment variables** - Automatic service discovery
✅ **Health checks** - Individual service monitoring
✅ **Zero maintenance** - Railway manages infrastructure

## 🚀 Next Steps

1. Push changes to GitHub
2. Create new Railway project
3. Add PostgreSQL service
4. Deploy backend service
5. Deploy frontend service
6. Set environment variables (API keys)
7. Test full-stack application

This gives you the same multi-service benefits as Docker Compose but optimized for Railway!
