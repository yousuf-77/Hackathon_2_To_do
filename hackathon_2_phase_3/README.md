# Hackathon Todo - AI-Powered Task Management

Full-stack todo application with AI-powered natural language task management, built with Next.js 15, FastAPI, and PostgreSQL.

## ✨ Features

### Core Functionality
- ✅ **User Authentication** - Sign up, sign in, session management with Better Auth
- ✅ **Task CRUD** - Create, read, update, delete tasks
- ✅ **AI Chatbot** - Natural language task creation via AI assistant
- ✅ **Real-time Updates** - Instant task status changes
- ✅ **Priority Management** - Low, medium, high priority levels
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile
- ✅ **Cyberpunk Theme** - Beautiful dark mode with neon accents

### AI-Powered Features (Phase 3)
- 🤖 **Natural Language Processing** - Create tasks by typing naturally
- 💬 **Chat Interface** - Floating chatbot widget
- 🎯 **Intent Detection** - Smart understanding of user commands
- 📝 **SSE Streaming** - Real-time AI responses
- 🔐 **JWT Authentication** - Secure API communication

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Animations**: Framer Motion
- **Authentication**: Better Auth
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: SQLModel
- **Authentication**: Better Auth + JWT
- **AI Provider**: Cohere API

## 📁 Project Structure

```
hackathon_2_phase_3/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js app router pages
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   └── dashboard/       # Dashboard page
│   ├── components/         # React components
│   │   ├── auth/           # Authentication components
│   │   ├── chatkit/        # Chatbot components
│   │   ├── task/           # Task-related components
│   │   ├── ui/             # Reusable UI components
│   │   └── landing/        # Landing page components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   └── public/             # Static assets
│
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API routes
│   │   │   └── routes/     # Route handlers
│   │   ├── agents/         # AI agent orchestrators
│   │   ├── core/           # Configuration
│   │   ├── db/             # Database session
│   │   ├── middleware/     # Custom middleware
│   │   ├── mcp/            # MCP tools
│   │   └── models/         # Database models
│   └── requirements.txt    # Python dependencies
│
├── docs/                    # Project documentation
├── specs/                   # Feature specifications
├── history/                 # Project history
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Python 3.12+ and pip
- PostgreSQL database (Neon recommended)
- Cohere API key (for AI features)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hackathon_2_phase_3
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create `.env.local` in the frontend directory:

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Cohere API
NEXT_PUBLIC_COHERE_API_KEY=your-cohere-key

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database
```

Create `.env` in the backend directory:

```bash
DATABASE_URL=postgresql://user:password@host/database
BETTER_AUTH_SECRET=your-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
COHERE_API_KEY=your-cohere-key
FRONTEND_URL=http://localhost:3000
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🏗️ Build for Production

```bash
cd frontend
npm run build
npm start
```

## 🐳 Docker Deployment

### Frontend

```bash
cd frontend
docker build -t hackathon-todo-frontend .
docker run -p 3000:3000 hackathon-todo-frontend
```

### Backend

```bash
cd backend
docker build -t hackathon-todo-backend .
docker run -p 8000:8000 hackathon-todo-backend
```

### Docker Compose (Full Stack)

```bash
docker-compose up -d
```

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions including:
- Vercel deployment guide
- Railway deployment guide
- Environment configuration
- Monitoring and logging
- Scaling considerations

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `BETTER_AUTH_SECRET` | Secret for Better Auth JWT | `random-secret-string` |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.example.com` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Frontend URL | `https://app.example.com` |
| `COHERE_API_KEY` | Cohere API key for AI features | `your-cohere-key` |

## 🧪 Testing

```bash
# Frontend type checking
cd frontend
npm run type-check

# Frontend linting
npm run lint

# Backend testing (if tests exist)
cd backend
pytest
```

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Better Auth](https://better-auth.com)
- [Cohere](https://cohere.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

Built with ❤️ for Hackathon
