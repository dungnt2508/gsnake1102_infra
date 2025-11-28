# Personalized Bot Web Application

A full-stack web application for personalized AI bot with user-specific personas, article summarization, scheduled fetching, and modular tool generation via n8n workflows.

## 🏗️ Architecture

- **Frontend**: Next.js 14+ with TypeScript and TailwindCSS
- **Backend**: Fastify with TypeScript
- **Database**: PostgreSQL 16+ and Redis 7+
- **Workflow Automation**: n8n (hosted at abc.pnj.com)
- **LLM Provider**: OpenAI API

## ✨ Features

- **Authentication**: Email/password login and Azure OAuth
- **Personalized AI**: Per-user persona (tone, language style, topics of interest)
- **Article Summarization**: Submit URLs for AI-powered summarization
- **Scheduled Fetching**: Automatically fetch and summarize articles on a schedule
- **Tool Request Mailbox**: Request custom tool generation via AI
- **Streaming Chat**: Real-time chat with persona-injected responses
- **Rate Limiting**: Per-user rate limits and quotas
- **n8n Integration**: Workflow automation for all async tasks

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 16+ (or use Docker)
- Redis 7+ (or use Docker)
- n8n instance (configured at abc.pnj.com)
- OpenAI API key

### 1. Clone and Setup

```bash
# Backend setup
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install

# Frontend setup
cd ../frontend
cp .env.example .env.local
# Edit .env.local with your configuration
npm install
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d

# Check services are running
docker-compose ps
```

### 3. Run Migrations

```bash
cd backend
npm run migrate
```

### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- pgAdmin: http://localhost:5050 (username: admin@admin.com, password: admin)

## 📁 Project Structure

```
gsnake1102/
├── backend/                # Fastify backend
│   ├── src/
│   │   ├── config/        # Configuration (DB, Redis, n8n, etc.)
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   ├── repositories/  # Database operations
│   │   ├── models/        # TypeScript types
│   │   ├── middleware/    # Auth, validation, etc.
│   │   └── utils/         # Helper functions
│   ├── migrations/        # Database migrations
│   └── package.json
│
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # API client, utilities
│   │   └── hooks/        # Custom hooks
│   └── package.json
│
├── docker-compose.yml    # PostgreSQL, Redis services
└── README.md
```

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
PORT=3001
JWT_SECRET=your-secret-key

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=gsnake1102
DB_USER=botuser
DB_PASSWORD=botpass

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Azure OAuth
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id

# n8n
N8N_BASE_URL=https://abc.pnj.com
N8N_API_KEY=your-n8n-api-key
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📊 Database Schema

The application uses the following tables:

- **users**: User accounts (email/password + Azure OAuth)
- **personas**: Per-user personalization settings
- **articles**: Article summarization requests and results
- **fetch_schedules**: Scheduled article fetching configuration
- **tool_requests**: Tool generation request mailbox

## 🔄 n8n Workflows

You need to create these workflows in your n8n instance at abc.pnj.com:

1. **Article Summary Workflow** (`/webhook/article-summary`):
   - Receives: articleId, url, userId
   - Fetches article content
   - Calls OpenAI for summarization with user persona
   - Calls back to `/api/articles/callback/:id`

2. **Scheduled Fetch Workflow** (`/webhook/scheduled-fetch`):
   - Triggered by schedule
   - Fetches article
   - Summarizes with persona
   - Updates database

3. **Tool Generation Workflow** (`/webhook/tool-generation`):
   - Receives: toolRequestId, requestPayload, userId
   - Generates code/tool using LLM
   - Calls back to `/api/tools/callback/:id`

## 🔐 Authentication

### Email/Password

```bash
# Register
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123"
}

# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Azure OAuth

1. GET `/api/auth/azure` - Get auth URL
2. Redirect user to Azure login
3. Azure redirects to `/api/auth/azure/callback?code=...`
4. Returns JWT token

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/azure` - Get Azure OAuth URL
- `GET /api/auth/azure/callback` - Azure OAuth callback
- `GET /api/auth/me` - Get current user

### Personas
- `GET /api/personas` - Get user's persona
- `POST /api/personas` - Create persona
- `PUT /api/personas` - Update persona
- `DELETE /api/personas` - Delete persona

### Articles
- `GET /api/articles` - List user's articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Submit article for summarization
- `DELETE /api/articles/:id` - Delete article

### Schedules
- `GET /api/schedules` - List fetch schedules
- `POST /api/schedules` - Create schedule
- `PUT /api/schedules/:id` - Update schedule
- `DELETE /api/schedules/:id` - Delete schedule

### Tools
- `GET /api/tools` - List tool requests (mailbox)
- `GET /api/tools/:id` - Get tool request
- `POST /api/tools` - Submit tool generation request
- `DELETE /api/tools/:id` - Delete tool request

### Chat
- `POST /api/chat` - Send chat message (with streaming support)
- `GET /api/chat/stream` - WebSocket endpoint for streaming

## 🛠️ Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production

```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
