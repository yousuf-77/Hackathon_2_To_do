# Hackathon Todo Frontend

Beautiful cyberpunk-themed todo application built with Next.js 16+, Better Auth, and Shadcn/UI.

## Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **UI Library**: Shadcn/UI (Radix UI + Tailwind CSS)
- **Authentication**: Better Auth with JWT
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **State Management**: React Server Components + Client Hooks
- **Deployment**: Vercel

## Features

- 🔐 Secure authentication with Better Auth + JWT
- 📱 Responsive design (mobile, tablet, desktop)
- 🎨 Beautiful cyberpunk theme with neon glows and glassmorphism
- ✅ Full CRUD operations for tasks
- 🎯 Task priorities (low, medium, high)
- 🌙 Dark/light mode toggle
- ⚡ Server-side rendering for optimal performance

## Getting Started

### Prerequisites

- Node.js 20+ (LTS)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hackathon-todo/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```bash
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:8000
JWT_EXPIRATION_DAYS=7
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Protected dashboard pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── ui/                 # Shadcn/UI base components
│   ├── task/               # Task-specific components
│   ├── layout/             # Layout components (Navbar, Sidebar)
│   ├── auth/               # Authentication components
│   └── command/            # Command palette
├── lib/                    # Utility libraries
│   ├── auth.ts             # Better Auth configuration
│   ├── api-client.ts       # JWT-protected API client
│   └── utils.ts            # Utility functions
├── hooks/                  # Custom React hooks
│   └── use-session.ts      # Session management hook
├── types/                  # TypeScript type definitions
│   ├── task.ts             # Task types
│   └── user.ts             # User types
└── public/                 # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Better Auth base URL | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth | Required |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `JWT_EXPIRATION_DAYS` | JWT token expiration (days) | `7` |

## Deployment

### Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Environment Variables for Production

```bash
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-project.vercel.app
BETTER_AUTH_SECRET=production-secret-min-32-chars
NEXT_PUBLIC_API_URL=https://your-backend-api.railway.app
JWT_EXPIRATION_DAYS=7
```

## Theme Customization

The application uses a custom cyberpunk theme defined in `app/globals.css`:

- **Neon Blue**: `#00d4ff` - Primary actions, low priority
- **Neon Pink**: `#ff00ff` - Secondary actions, high priority
- **Neon Green**: `#00ff88` - Success states, completed tasks
- **Neon Yellow**: `#ffcc00` - Medium priority
- **Neon Purple**: `#9d4edd` - Accent color

## Component Library

Built with [Shadcn/UI](https://ui.shadcn.com) components:

- Button, Card, Input, Label
- Checkbox, Badge, Dialog
- Table, Command, Toast
- Dropdown Menu, Avatar, Select

All components are styled with the cyberpunk theme.

## API Integration

The frontend communicates with the backend using a JWT-protected API client:

```typescript
import { apiClient } from "@/lib/api-client";

// GET request
const tasks = await apiClient.get<Task[]>("/api/tasks");

// POST request
const task = await apiClient.post<Task>("/api/tasks", { title: "New Task" });

// PUT request
await apiClient.put(`/api/tasks/${id}`, { title: "Updated" });

// DELETE request
await apiClient.delete(`/api/tasks/${id}`);
```

## License

MIT License - feel free to use this project for your own hackathon!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
