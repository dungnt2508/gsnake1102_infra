# Quick Setup Guide

## ✅ Completed Steps

1. ✅ Backend dependencies installed (0 vulnerabilities)
2. ✅ Frontend dependencies installed (0 vulnerabilities)
3. ✅ Docker Compose configured with:
   - PostgreSQL with pgvector
   - Redis
   - pgAdmin
   - Redis Insight

## 📋 Next Steps to Run the Application

### 1. Configure Environment Variables

#### Backend (.env)
```bash
cd backend
copy .env.example .env
```

Edit `backend\.env` and fill in:
```env
# Required
OPENAI_API_KEY=sk-your-key-here
JWT_SECRET=your-random-secret-key-change-me

# Optional - Azure OAuth (if using)
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id

# Optional - n8n API Key
N8N_API_KEY=your-n8n-api-key
```

#### Frontend (.env.local)
```bash
cd ../frontend
copy .env.example .env.local
```

The default should work:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. Start Docker Services

```bash
# From project root
docker-compose up -d

# Check all services are healthy
docker-compose ps
```

**Access points:**
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`
- pgAdmin: `http://localhost:5050`
  - Email: `gsnake6789@gmail.com`
  - Password: `gsnake6789`
- Redis Insight: `http://localhost:8389`

### 3. Run Database Migrations

```bash
cd backend
npm run migrate
```

### 4. Start Development Servers

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:3001`

#### Terminal 2 - Frontend
```bash
cd frontend  
npm run dev
```
Frontend will run on: `http://localhost:3000`

### 5. Test the Application

1. Open browser: `http://localhost:3000`
2. Click "Register" and create an account
3. After login, you'll see the dashboard
4. Navigate to different features

## 🔧 n8n Workflows (Required for Full Functionality)

You need to create 3 workflows in your n8n instance at `abc.pnj.com`:

### Workflow 1: Article Summary
- **Webhook URL**: `/webhook/article-summary`
- **Input**: `{ articleId, url, userId }`
- **Steps**:
  1. Receive webhook
  2. Fetch article content from URL
  3. Get user persona from backend API
  4. Call OpenAI for summarization with persona context
  5. POST result to: `http://your-backend/api/articles/callback/:articleId`

### Workflow 2: Scheduled Fetch
- **Webhook URL**: `/webhook/scheduled-fetch`
- **Triggered by**: Schedule trigger in n8n
- **Steps**:
  1. Query backend for due schedules
  2. For each schedule, fetch and summarize article
  3. Update backend with results

### Workflow 3: Tool Generation
- **Webhook URL**: `/webhook/tool-generation`
- **Input**: `{ toolRequestId, requestPayload, userId }`
- **Steps**:
  1. Receive webhook
  2. Get user persona
  3. Call OpenAI to generate tool code
  4. POST result to: `http://your-backend/api/tools/callback/:toolRequestId`

## 📊 Database Connection (pgAdmin)

1. Open pgAdmin: `http://localhost:5050`
2. Login with credentials above
3. Right-click "Servers" → Register → Server
4. Fill in:
   - Name: `gsnake1102_dev`
   - Host: `postgres` (Docker service name)
   - Port: `5432` (Internal Docker port is still 5432)
   - Database: `gsnake1102`
   - Username: `gsnake1102_user`
   - Password: `gsnake1102_pw`

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check migrations ran
cd backend
npm run migrate
```

### Frontend won't start
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
npm run dev
```

### Can't connect to database
```bash
# Restart Docker services
docker-compose restart postgres redis
```

## 🚀 Ready to Deploy?

For production deployment:
1. Set `NODE_ENV=production`
2. Update all secrets in `.env`
3. Use proper PostgreSQL/Redis instances (not Docker)
4. Build frontend: `npm run build`
5. Build backend: `npm run build`
6. Use process manager (PM2, systemd) for backend
7. Deploy frontend to Vercel/Netlify or use `npm start`

---

**Need help?** Check the detailed documentation in `README.md`
