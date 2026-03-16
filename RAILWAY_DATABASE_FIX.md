# Railway PostgreSQL Environment Variables Guide

## 🚨 Issue: DATABASE_URL is Empty/Malformed

Your current variables:
- DATABASE_URL = "" (empty or malformed)
- DATABASE_USERNAME = "your_configured_value"
- DATABASE_PASSWORD = "your_configured_value"

## 🎯 Railway PostgreSQL Variable Format

Railway automatically provides these variables for PostgreSQL service:

### Correct Railway Variables:
```
PGHOST = your-db-host.railway.app
PGPORT = 5432
PGUSER = postgres
PGPASSWORD = your-password
PGDATABASE = railway
```

### Required DATABASE_URL Format:
```
jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
```

## 🔧 Solution Options

### Option 1: Use Railway's Automatic Variables
Update your Railway variables to use Railway's format:

```
DATABASE_URL = jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
DATABASE_USERNAME = ${PGUSER}
DATABASE_PASSWORD = ${PGPASSWORD}
```

### Option 2: Manual PostgreSQL Connection
Or manually set in Railway dashboard:
```
DATABASE_URL = jdbc:postgresql://your-host:5432/railway
DATABASE_USERNAME = postgres
DATABASE_PASSWORD = your-actual-password
```

## 🚀 Quick Fix

In Railway dashboard, update DATABASE_URL to:
```
jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}
```

This will use Railway's automatic PostgreSQL variables!
