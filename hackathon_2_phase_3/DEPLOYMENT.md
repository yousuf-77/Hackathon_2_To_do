# Production Deployment Guide

This guide covers deploying the Hackathon Todo application to production.

## Architecture

```
┌─────────────────────┐
│                     │
│   Vercel / Netlify  │  ← Frontend (Next.js)
│                     │
└──────────┬──────────┘
           │
           │ HTTPS/JWT
           │
┌──────────▼──────────┐
│                     │
│  Railway / Render   │  ← Backend (FastAPI + PostgreSQL)
│                     │
└─────────────────────┘
```

## Environment Variables

### Frontend Environment Variables (.env.local for development, Vercel/Railway for production)

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-domain.com
BETTER_AUTH_SECRET=your-secret-here

# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Cohere API (Phase 3)
NEXT_PUBLIC_COHERE_API_KEY=your-cohere-key

# Database (Neon PostgreSQL for Better Auth user storage)
DATABASE_URL=postgresql://user:password@host/database
```

### Backend Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# JWT Configuration
BETTER_AUTH_SECRET=your-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# Cohere API (Phase 3)
COHERE_API_KEY=your-cohere-key

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend-domain.com
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### 1. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from frontend directory
cd frontend
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_BETTER_AUTH_URL=https://your-frontend-domain.vercel.app
# - NEXT_PUBLIC_API_URL=https://your-backend.railway.app
# - BETTER_AUTH_SECRET (generate a secure random string)
# - DATABASE_URL (your Neon PostgreSQL connection string)
# - NEXT_PUBLIC_COHERE_API_KEY (your Cohere API key)
```

#### 2. Deploy Backend to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Deploy from backend directory
cd ../backend
railway init
railway up

# Set environment variables in Railway dashboard
# - DATABASE_URL
# - BETTER_AUTH_SECRET
# - JWT_ALGORITHM=HS256
# - JWT_EXPIRATION_DAYS=7
# - COHERE_API_KEY
# - FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Option 2: Vercel (Full Stack with Serverless)

#### Deploy Backend as Vercel Serverless Functions

1. Create `/api/proxy/[...path]/route.ts` in frontend:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL;
  const path = params.path.join("/");
  const url = `${backendUrl}/${path}?${request.nextUrl.searchParams.toString()}`;

  const response = await fetch(url, {
    headers: headers() as HeadersInit,
  });

  return response;
}
```

2. Deploy everything to Vercel

### Option 3: Self-Hosted with Docker

#### Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
      - NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/hackathon_todo
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=hackathon_todo
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Pre-Deployment Checklist

- [ ] Update all environment variables
- [ ] Test database migrations
- [ ] Verify CORS settings include production domains
- [ ] Test authentication flow
- [ ] Test API endpoints
- [ ] Test chatbot functionality
- [ ] Set up monitoring/logging
- [ ] Configure error tracking (Sentry)
- [ ] Set up backup strategy
- [ ] Configure SSL certificates
- [ ] Test payment flow (if applicable)
- [ ] Review and optimize performance
- [ ] Set up CDN for static assets
- [ ] Configure rate limiting
- [ ] Test load balancing
- [ ] Document deployment process
- [ ] Create runbook for operations

## Post-Deployment Steps

1. **Verify Health Checks**
   - Frontend: `https://your-domain.com/` should load landing page
   - Backend Health: `curl https://your-backend-url.com/health`
   - API Docs: `https://your-backend-url.com/docs`

2. **Test Authentication**
   - Sign up: Create new account
   - Sign in: Login with credentials
   - Session persistence: Refresh page and verify session

3. **Test Core Features**
   - Create task via form
   - Create task via chatbot
   - Toggle task completion
   - Delete task
   - View task list

4. **Monitor Performance**
   - Check Vercel/Railway logs
   - Monitor error rates
   - Track API response times
   - Set up alerts

## Scaling Considerations

### Frontend (Vercel)
- Automatic scaling with Vercel Edge Network
- Serverless functions auto-scale
- Static assets served from CDN

### Backend (Railway)
- Vertical scaling: Increase RAM/CPU
- Horizontal scaling: Add more containers
- Database: Use managed PostgreSQL with read replicas
- Redis for session management (optional)

### Database (Neon PostgreSQL)
- Connection pooling
- Read replicas for read-heavy workloads
- Automated backups
- Point-in-time recovery

## Monitoring & Logging

### Recommended Tools
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - Infrastructure monitoring
- **Vercel Analytics** - Frontend performance

## Rollback Strategy

```bash
# Frontend rollback (Vercel)
vercel rollback

# Backend rollback (Railway)
railway rollback
```

## Support & Troubleshooting

For issues or questions:
1. Check logs: `vercel logs` or `railway logs`
2. Review environment variables
3. Test database connectivity
4. Verify CORS configuration
5. Check JWT token validity
