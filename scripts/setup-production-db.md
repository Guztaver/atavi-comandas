# Production Database Setup Guide

## Quick Setup with Turso (Recommended)

Turso is a free SQLite-compatible database that works perfectly with Vercel.

### 1. Install Turso CLI
```bash
curl -sSfL https://get.tur.so/install.sh | bash
```

### 2. Create Turso Account
```bash
turso auth login
```

### 3. Create Database
```bash
turso db create atavi-comandas
```

### 4. Get Database URL
```bash
turso db show atavi-comandas --show-url
```

### 5. Get Auth Token
```bash
turso db tokens create atavi-comandas
```

### 6. Set Environment Variables in Vercel

Go to your Vercel project dashboard → Settings → Environment Variables and add:

```
DATABASE_URL=libsql://your-db-url.turso.io
DATABASE_AUTH_TOKEN=your-auth-token
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 7. Deploy

After setting the environment variables, redeploy your application:

```bash
git push origin main
```

## Alternative: Vercel Postgres

If you prefer using Vercel's managed PostgreSQL:

### 1. Add Vercel Postgres
- Go to Vercel dashboard → Storage → Create Database
- Choose PostgreSQL
- Select your region

### 2. Update Database Configuration
You'll need to modify `lib/db/index.ts` to use PostgreSQL instead of SQLite.

### 3. Set Environment Variables
Vercel will automatically add the `POSTGRES_URL` and related variables.

## Testing

After deployment, test the authentication by:
1. Visiting your app
2. Try logging in with admin@atavi.com / admin123
3. Check Vercel logs for any errors

The first login will automatically create the default users and menu items.