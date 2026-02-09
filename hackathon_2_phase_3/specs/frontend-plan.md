# specs/frontend-plan.md

## Frontend Technical Implementation Plan

**Project:** Hackathon II Phase II – Todo Full-Stack Web Application
**Scope:** Frontend Only (Next.js 16+ in `/frontend/`)
**Status:** Draft | **Priority:** Critical
**Dependencies:** @constitution.md, @specs/ui/theme.md, @specs/ui/components.md, @specs/ui/pages.md, @specs/features/authentication-frontend.md

---

## Executive Summary

This plan details the technical implementation of the frontend for the Hackathon II Phase II Todo web application. The frontend is a **Next.js 16+ App Router** application with **Better Auth** authentication, **Shadcn/UI** components, **Tailwind CSS** with a custom cyberpunk/neon theme, and a **JWT-protected API client** for communicating with the FastAPI backend.

**Key Success Metrics:**
- 🎨 **Beautiful UI:** Cyberpunk theme with neon glows, glassmorphism, smooth animations
- 🔐 **Secure Auth:** Better Auth + JWT with automatic token attachment
- 📱 **Responsive:** Mobile-first design, works on all screen sizes
- ⚡ **Fast:** Server Components by default, optimized loading states
- 🚀 **Deployable:** Ready for Vercel deployment with environment variables

**Implementation Timeline:** ~4-6 hours (following spec-driven development)

---

## 1. Frontend Architecture

### 1.1 Technology Stack

**Core Framework:**
- **Next.js 16+** (App Router, not Pages Router)
- **React 19** (latest, Server Components enabled)
- **TypeScript 5** (strict mode)

**Styling & UI:**
- **Tailwind CSS 4+** (utility-first CSS)
- **Shadcn/UI** (Radix UI primitives + Tailwind)
- **next-themes** (theme switching)
- **Lucide React** (icon library)

**Authentication:**
- **Better Auth** (authentication library)
- **JWT Plugin** (token issuance and management)

**State Management:**
- React Server Components (default)
- React hooks for client state
- URL query params for filters/sorting

**Deployment:**
- **Vercel** (Next.js hosting platform)
- Environment variables for configuration

### 1.2 Directory Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout (ThemeProvider, fonts)
│   ├── page.tsx                # Root page (redirect to login/dashboard)
│   ├── globals.css             # Global styles (CSS variables, Tailwind)
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── signup/
│   │   └── page.tsx            # Signup page
│   ├── dashboard/
│   │   ├── layout.tsx          # Protected layout (auth check)
│   │   ├── page.tsx            # Dashboard (task list)
│   │   └── loading.tsx         # Loading skeleton
│   ├── tasks/
│   │   └── [id]/
│   │       └── page.tsx        # Task detail (optional)
│   ├── api/
│   │   └── auth/
│   │       └── [...auth]/
│   │           └── route.ts    # Better Auth API route
│   └── not-found.tsx           # 404 page
├── components/
│   ├── ui/                     # Shadcn/UI base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── checkbox.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── table.tsx
│   │   ├── command.tsx
│   │   ├── toast.tsx
│   │   └── use-toast.ts
│   ├── task/
│   │   ├── task-card.tsx       # Client Component
│   │   ├── task-list.tsx       # Server Component
│   │   ├── task-table.tsx      # Client Component
│   │   ├── task-form.tsx       # Client Component
│   │   ├── add-task-dialog.tsx # Client Component
│   │   └── edit-task-dialog.tsx # Client Component
│   ├── layout/
│   │   ├── navbar.tsx          # Client Component
│   │   ├── sidebar.tsx         # Client Component
│   │   └── footer.tsx          # Server Component
│   ├── auth/
│   │   ├── login-form.tsx      # Client Component
│   │   ├── signup-form.tsx     # Client Component
│   │   └── user-menu.tsx       # Client Component
│   ├── command/
│   │   └── command-palette.tsx # Client Component
│   └── theme/
│       └── theme-provider.tsx  # Client Component
├── lib/
│   ├── auth.ts                 # Better Auth configuration
│   ├── api-client.ts           # JWT-protected API client
│   └── utils.ts                # Utility functions
├── hooks/
│   ├── use-session.ts          # Session management hook
│   └── use-media-query.ts      # Responsive design hook
├── types/
│   ├── task.ts                 # Task type definitions
│   └── user.ts                 # User type definitions
├── middleware.ts               # Route protection middleware
├── tailwind.config.ts          # Tailwind configuration
├── next.config.ts              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies
├── .env.local                  # Local environment variables
└── .env.example                # Example environment variables
```

### 1.3 Server vs Client Component Strategy

**Server Components (Default):**
- **Layouts:** Root layout, dashboard layout
- **Pages:** Dashboard page (SSR task list), task detail page
- **Static Components:** Footer, sidebar (navigation)
- **Data Fetching:** All API calls for initial page load

**Benefits:**
- Faster initial page load (SSR)
- Smaller client bundle (no React runtime on server)
- SEO friendly (if needed)
- Secure (server-side session checks)

**Client Components ("use client"):**
- **Interactive Forms:** LoginForm, SignupForm, TaskForm
- **State Management:** TaskFilters, CommandPalette
- **User Interactions:** Navbar (user menu), TaskCard (checkbox, buttons)
- **Browser APIs:** Theme switcher (localStorage), Command palette (keyboard)

**Rule of Thumb:**
- If it needs `useState`, `useEffect`, or event handlers → Client Component
- If it's static or fetches data → Server Component

---

## 2. Theme Implementation Strategy

### 2.1 Cyberpunk/Neon Theme Design

**Design Principles:**
1. **Dark-First:** Dark mode is the default experience
2. **High Contrast:** Neon colors against deep black backgrounds
3. **Glow Effects:** Box-shadows and text-shadows for neon glow
4. **Glassmorphism:** Translucent cards with backdrop blur
5. **Smooth Animations:** 200ms transitions on all interactive elements

### 2.2 Color System

**CSS Variables (HSL Format):**
```css
/* Base Colors (Dark Mode) */
:root {
  /* Background & Surface */
  --background: 0 0% 4%;           /* #0a0a0a - Deep black */
  --foreground: 92 8% 93%;         /* #ededed - Off-white text */

  /* Primary Actions (Neon Cyan) */
  --primary: 189 100% 50%;          /* #00d4ff */
  --primary-foreground: 0 0% 4%;

  /* Secondary Actions (Neon Pink) */
  --secondary: 300 100% 50%;        /* #ff00ff */
  --secondary-foreground: 0 0% 4%;

  /* Success (Neon Green) */
  --success: 144 100% 50%;          /* #00ff88 */

  /* Warning (Neon Yellow) */
  --warning: 48 100% 50%;           /* #ffcc00 */

  /* Card & Glassmorphism */
  --card: 0 0% 4%;
  --card-foreground: 92 8% 93%;
  --border: 217 33% 17%;
  --input: 217 33% 17%;
  --ring: 189 100% 50%;

  /* Custom Neon Colors */
  --neon-blue: 189 100% 50%;
  --neon-pink: 300 100% 50%;
  --neon-green: 144 100% 50%;
  --neon-yellow: 48 100% 50%;
  --neon-purple: 270 100% 60%;
}
```

**Priority Color Mapping:**
- **Low:** Neon Blue (`--neon-blue`)
- **Medium:** Neon Yellow (`--neon-yellow`)
- **High:** Neon Pink (`--neon-pink`)

### 2.3 Typography System

**Font Families:**
```css
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

**Type Scale:**
```javascript
// tailwind.config.ts
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1rem' }],
  'sm': ['0.875rem', { lineHeight: '1.25rem' }],
  'base': ['1rem', { lineHeight: '1.5rem' }],
  'lg': ['1.125rem', { lineHeight: '1.75rem' }],
  'xl': ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['2rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.5rem', { lineHeight: '2.5rem' }],
}
```

### 2.4 Visual Effects Implementation

**Neon Glow (CSS):**
```css
.neon-glow {
  box-shadow:
    0 0 10px rgba(0, 212, 255, 0.5),
    0 0 20px rgba(0, 212, 255, 0.3),
    0 0 40px rgba(0, 212, 255, 0.1);
}

.neon-glow-pink {
  box-shadow:
    0 0 10px rgba(255, 0, 255, 0.5),
    0 0 20px rgba(255, 0, 255, 0.3);
}
```

**Glassmorphism (CSS):**
```css
.glass-card {
  background: rgba(10, 10, 10, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}
```

**Gradients (CSS):**
```css
.gradient-primary {
  background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
}

.gradient-secondary {
  background: linear-gradient(135deg, #ff00ff 0%, #ff00aa 100%);
}

.gradient-text {
  background: linear-gradient(135deg, #00d4ff 0%, #ff00ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### 2.5 Tailwind Configuration

**File:** `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        // ... other Shadcn colors
        neon: {
          blue: "hsl(var(--neon-blue))",
          pink: "hsl(var(--neon-pink))",
          green: "hsl(var(--neon-green))",
          yellow: "hsl(var(--neon-yellow))",
          purple: "hsl(var(--neon-purple))",
        },
        priority: {
          low: "hsl(var(--neon-blue))",
          medium: "hsl(var(--neon-yellow))",
          high: "hsl(var(--neon-pink))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 212, 255, 0.5)",
        "neon-pink": "0 0 20px rgba(255, 0, 255, 0.5)",
        "neon-green": "0 0 20px rgba(0, 255, 136, 0.5)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 2.6 Global Styles

**File:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* [Insert all CSS variables from section 2.2] */
  }

  .light {
    /* Light mode overrides (optional) */
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer components {
  /* Neon Glow Utilities */
  .neon-glow {
    box-shadow:
      0 0 10px rgba(0, 212, 255, 0.5),
      0 0 20px rgba(0, 212, 255, 0.3),
      0 0 40px rgba(0, 212, 255, 0.1);
  }

  .neon-glow-pink {
    box-shadow:
      0 0 10px rgba(255, 0, 255, 0.5),
      0 0 20px rgba(255, 0, 255, 0.3);
  }

  /* Glassmorphism */
  .glass {
    @apply bg-white/5 backdrop-blur-lg border border-white/10;
  }

  .glass-card {
    @apply glass rounded-lg;
  }

  /* Text Effects */
  .neon-text {
    text-shadow:
      0 0 10px currentColor,
      0 0 20px currentColor;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-neon-blue to-neon-pink bg-clip-text text-transparent;
  }
}
```

### 2.7 Theme Switcher Implementation

**Component:** `components/theme/theme-provider.tsx`

```typescript
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

**Usage in Root Layout:**
```typescript
// app/layout.tsx
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 3. Better Auth Integration

### 3.1 Installation

```bash
npm install better-auth
```

### 3.2 Configuration

**File:** `lib/auth.ts`

```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    jwt({
      issuer: "hackathon-todo",
      audience: "hackathon-todo-api",
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    }),
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Skip for hackathon
  },
});
```

### 3.3 API Route

**File:** `app/api/auth/[...auth]/route.ts`

```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

### 3.4 Client-Side Hooks

**Session Hook:** `hooks/use-session.ts`

```typescript
"use client";

import { useSession } from "better-auth/react";

export function useSession() {
  const session = useSession();
  return session;
}
```

**Usage in Client Components:**
```typescript
"use client";

import { useSession } from "@/hooks/use-session";

export function UserProfile() {
  const session = useSession();

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      <p>{session.user.email}</p>
    </div>
  );
}
```

### 3.5 Server-Side Session

**Usage in Server Components:**
```typescript
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <p>Welcome, {session.user.name}</p>
      {/* ... */}
    </div>
  );
}
```

### 3.6 Authentication Flows

**Sign Up:**
```typescript
import { auth } from "@/lib/auth";

async function handleSignUp(email: string, password: string, name: string) {
  const user = await auth.signUp.email({
    email,
    password,
    name,
  });

  if (user.error) {
    // Show error toast
    return;
  }

  // Redirect to dashboard (Better Auth handles this)
  router.push("/dashboard");
}
```

**Sign In:**
```typescript
async function handleSignIn(email: string, password: string) {
  const user = await auth.signIn.email({
    email,
    password,
  });

  if (user.error) {
    // Show error toast
    return;
  }

  // Redirect to dashboard (Better Auth handles this)
  router.push("/dashboard");
}
```

**Sign Out:**
```typescript
async function handleSignOut() {
  await auth.signOut();
  router.push("/login");
}
```

---

## 4. JWT Token Management

### 4.1 Token Extraction

**Server-Side:**
```typescript
import { auth } from "@/lib/auth";

export async function getToken(): Promise<string | null> {
  const session = await auth();
  return session?.token || null;
}
```

**Client-Side:**
```typescript
import { auth } from "@/lib/auth";

export async function getClientToken(): Promise<string | null> {
  const session = await auth.getClient();
  return session?.token || null;
}
```

### 4.2 API Client with Auto-JWT

**File:** `lib/api-client.ts`

**Skill to Use:** `nextjs-api-client-with-jwt`

```typescript
import { auth } from "@/lib/auth";

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async getToken(): Promise<string | null> {
    const session = await auth.getClient();
    return session?.token || null;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        // Add credentials for cookies
        credentials: "include",
      });

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Unauthorized");
        }

        // Parse error response
        const error = await response.json();
        throw new Error(error.detail || error.message || "API request failed");
      }

      return await response.json();
    } catch (error) {
      // Log error (optional: send to error tracking)
      console.error("API request failed:", error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint: string): Promise<void> {
    await this.request<void>(endpoint, { method: "DELETE" });
  }
}

// Singleton instance
export const apiClient = new ApiClient();
```

### 4.3 Usage Example

**Fetch Tasks:**
```typescript
import { apiClient } from "@/lib/api-client";

interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  created_at: string;
  updated_at: string;
}

async function getTasks(userId: string): Promise<Task[]> {
  return apiClient.get<Task[]>(`/api/${userId}/tasks`);
}
```

**Create Task:**
```typescript
async function createTask(userId: string, data: CreateTaskDto): Promise<Task> {
  return apiClient.post<Task>(`/api/${userId}/tasks`, data);
}
```

---

## 5. Protected Routes & Session Management

### 5.1 Middleware Protection

**File:** `middleware.ts`

```typescript
import { authMiddleware } from "@/lib/auth";

export default authMiddleware({
  publicRoutes: ["/login", "/signup"],
  loginRoute: "/login",
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Behavior:**
- Intercept all routes except API routes and static files
- Check authentication status
- Redirect unauthenticated users to `/login`
- Allow public routes (`/login`, `/signup`) without auth

### 5.2 Layout-Level Protection

**File:** `app/dashboard/layout.tsx`

```typescript
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
```

**Benefits:**
- Server-side check (more secure)
- Faster redirect (no client-side flash)
- Works with SSR

### 5.3 Client-Side Protection (Optional)

**Hook:** `hooks/use-require-auth.ts`

```typescript
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await auth.getClient();
      if (!session) {
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);
}
```

**Usage:**
```typescript
"use client";

import { useRequireAuth } from "@/hooks/use-require-auth";

export default function ProtectedPage() {
  useRequireAuth();

  return <div>Protected content</div>;
}
```

---

## 6. Environment Variables

### 6.1 Required Variables

**File:** `.env.local`

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars-here

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: JWT Configuration
JWT_EXPIRATION_DAYS=7
```

### 6.2 Example File

**File:** `.env.example`

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# JWT Configuration (optional)
JWT_EXPIRATION_DAYS=7
```

### 6.3 Production Variables

**File:** `.env.production`

```bash
# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=https://hackathon-todo.vercel.app
BETTER_AUTH_SECRET=production-secret-min-32-chars-here

# Backend API URL
NEXT_PUBLIC_API_URL=https://hackathon-todo-backend.railway.app

# JWT Configuration
JWT_EXPIRATION_DAYS=7
```

### 6.4 Vercel Environment Variables

**Configuration:**
1. Go to Vercel project settings
2. Add environment variables:
   - `NEXT_PUBLIC_BETTER_AUTH_URL`
   - `BETTER_AUTH_SECRET`
   - `NEXT_PUBLIC_API_URL`
   - `JWT_EXPIRATION_DAYS` (optional)
3. Redeploy to apply changes

**Security:**
- Never commit `.env.local` to git
- Add `.env.local` to `.gitignore`
- Use different secrets for production
- Rotate secrets periodically

---

## 7. Local Development Setup

### 7.1 Prerequisites

- Node.js 20+ (LTS)
- npm or yarn or pnpm
- Git

### 7.2 Installation

```bash
# Clone repository
git clone https://github.com/your-username/hackathon-todo.git
cd hackathon-todo/frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local
```

### 7.3 Development Server

```bash
# Start development server
npm run dev

# Open browser
# Navigate to http://localhost:3000
```

**Development Features:**
- Hot Module Replacement (HMR)
- Fast Refresh
- TypeScript checking
- ESLint (optional)
- Tailwind CSS JIT compilation

### 7.4 Backend Setup

**Prerequisites:** Backend must be running on `http://localhost:8000`

```bash
# In backend directory
cd ../backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 7.5 Testing Locally

**Test Authentication Flow:**
1. Navigate to `http://localhost:3000`
2. Should redirect to `/login`
3. Sign up with email and password
4. Should redirect to `/dashboard`
5. Logout via user menu
6. Should redirect to `/login`

**Test Task CRUD:**
1. Click "Add Task" button
2. Fill form and submit
3. Task should appear in list
4. Click checkbox to mark complete
5. Click edit button to modify
6. Click delete button to remove

---

## 8. Vercel Deployment

### 8.1 Preparation

**Build Command:**
```bash
npm run build
```

**Output:** `.next/` directory

### 8.2 Deployment Steps

**Option 1: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**Option 2: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
5. Add environment variables
6. Click "Deploy"

### 8.3 Environment Variables on Vercel

**Configuration:**
1. Go to Project Settings → Environment Variables
2. Add variables:
   - `NEXT_PUBLIC_BETTER_AUTH_URL` → `https://your-project.vercel.app`
   - `BETTER_AUTH_SECRET` → (generate secure secret)
   - `NEXT_PUBLIC_API_URL` → (backend URL)
3. Apply to all environments (production, preview, development)
4. Redeploy to apply changes

### 8.4 Custom Domain (Optional)

**Steps:**
1. Go to Project Settings → Domains
2. Add custom domain (e.g., `todo.yourdomain.com`)
3. Configure DNS records
4. Wait for SSL certificate provisioning

### 8.5 Deployment Checklist

- [ ] All environment variables are set
- [ ] Build succeeds locally (`npm run build`)
- [ ] Backend API is deployed and accessible
- [ ] CORS is configured on backend (allow Vercel domain)
- [ ] Better Auth secret is set and secure
- [ ] Homepage redirects to login or dashboard
- [ ] Authentication flow works end-to-end
- [ ] Task CRUD operations work
- [ ] Responsive design works on mobile
- [ ] Theme switcher works

---

## 9. Risk Analysis & Mitigation

### 9.1 CORS Issues

**Risk:** Backend rejects frontend requests due to CORS policy.

**Symptoms:**
- Browser console shows CORS errors
- API requests fail with "Access-Control-Allow-Origin" error

**Mitigation:**
```python
# Backend FastAPI configuration
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Local development
        "https://hackathon-todo.vercel.app",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Testing:**
```bash
# Test CORS from browser
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS http://localhost:8000/api/123/tasks
```

### 9.2 Token Expiry & Refresh

**Risk:** JWT token expires while user is active, causing 401 errors.

**Current Setup:**
- Token expires after 7 days
- User must re-authenticate after expiry

**Mitigation (Optional):**
- Implement token refresh mechanism
- Use shorter access token expiry (1 hour)
- Implement refresh token rotation
- Auto-refresh token in background

**Implementation (Bonus):**
```typescript
// Auto-refresh token before expiry
useEffect(() => {
  const checkTokenExpiry = async () => {
    const session = await auth.getClient();
    if (session?.token) {
      const decoded = jwtDecode(session.token);
      const expiryTime = decoded.exp * 1000;
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      // Refresh 5 minutes before expiry
      if (timeUntilExpiry < 5 * 60 * 1000) {
        await auth.refresh();
      }
    }
  };

  const interval = setInterval(checkTokenExpiry, 60 * 1000); // Check every minute
  return () => clearInterval(interval);
}, []);
```

### 9.3 401 Unauthorized Handling

**Risk:** User gets stuck in redirect loop when token expires.

**Mitigation:**
1. **API Client:** Redirect to `/login` on 401
2. **Middleware:** Protect routes at edge
3. **Layout:** Server-side session check
4. **Client Hooks:** Double-check auth state

**Implementation:**
```typescript
// In api-client.ts
if (response.status === 401) {
  // Clear session
  await auth.signOut();

  // Redirect to login
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }

  throw new Error("Unauthorized");
}
```

### 9.4 XSS & Token Theft

**Risk:** Malicious script steals JWT token from localStorage.

**Current Setup:**
- Better Auth uses HTTP-only cookies by default
- Cookies are not accessible via JavaScript
- Secure flag prevents transmission over HTTP

**Best Practices:**
- Use HTTP-only cookies (default)
- Enable `Secure` flag (HTTPS only)
- Set `SameSite=strict` (CSRF protection)
- Sanitize all user input
- Implement Content Security Policy (CSP)

**CSP Configuration (Next.js):**
```javascript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};
```

### 9.5 Session Persistence

**Risk:** User is logged out after page refresh.

**Current Setup:**
- Better Auth persists session in HTTP-only cookie
- Cookie is sent with every request automatically
- No manual token management needed

**Testing:**
```bash
# Test session persistence
1. Login to application
2. Refresh page (F5)
3. Should still be logged in
4. Close browser and reopen
5. Should still be logged in (if "Remember me" is checked)
```

### 9.6 Responsive Design Issues

**Risk:** UI breaks on mobile devices or different screen sizes.

**Mitigation:**
1. **Mobile-First Design:** Start with mobile layout, then expand
2. **Breakpoint Testing:** Test on 375px, 768px, 1024px, 1440px
3. **Device Testing:** Test on real devices (iOS, Android)
4. **Browser Testing:** Test on Chrome, Firefox, Safari, Edge
5. **Accessibility:** Test with screen reader (NVDA, VoiceOver)

**Tools:**
- Chrome DevTools Device Mode
- BrowserStack (cross-browser testing)
- Lighthouse (accessibility audit)

### 9.7 Performance Issues

**Risk:** Slow page load or janky animations.

**Mitigation:**
1. **Server Components:** Reduce client bundle size
2. **Code Splitting:** Dynamic imports for heavy components
3. **Image Optimization:** Use `next/image` component
4. **Font Optimization:** Use `next/font` for custom fonts
5. **Lazy Loading:** Load components on demand
6. **Caching:** Cache API responses with SWR or React Query

**Performance Targets:**
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3s
- Cumulative Layout Shift (CLS): <0.1

---

## 10. Beautiful UI Implementation Details

### 10.1 Design Principles for Judge Impression

**1. First Impressions Matter:**
- Stunning landing page with gradient text and neon glows
- Smooth page transitions (200ms ease-in-out)
- Professional typography (Inter font)

**2. Micro-Interactions:**
- Button hover: Scale up + glow effect
- Input focus: Neon ring + label animation
- Card hover: Lift + shadow increase
- Checkbox: Smooth animation when checked

**3. Visual Hierarchy:**
- Large headings with gradient text
- High contrast for readability
- Color-coded priority badges
- Consistent spacing (8px grid)

**4. Glassmorphism:**
- Translucent cards with backdrop blur
- Subtle borders for depth
- Layered shadows for dimensionality

**5. Cyberpunk Aesthetics:**
- Neon colors (cyan, pink, green, yellow)
- Dark background (#0a0a0a)
- Glowing text and borders
- Futuristic feel

### 10.2 Component Styling Guide

**Button with Neon Glow:**
```tsx
<Button className="neon-glow hover:scale-105 transition-all duration-200">
  Add Task
</Button>
```

**Card with Glassmorphism:**
```tsx
<Card className="glass-card hover:shadow-neon transition-all duration-200">
  <CardHeader>
    <CardTitle className="gradient-text">Task Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Task description</p>
  </CardContent>
</Card>
```

**Input with Neon Focus:**
```tsx
<Input className="focus:ring-2 focus:ring-neon-blue focus:shadow-neon" />
```

**Badge with Priority Colors:**
```tsx
<Badge
  variant={
    task.priority === "high" ? "destructive" :
    task.priority === "medium" ? "secondary" :
    "default"
  }
>
  {task.priority.toUpperCase()}
</Badge>
```

### 10.3 Page Layout Styling

**Dashboard Page:**
```tsx
<div className="min-h-screen bg-background">
  {/* Gradient background effect */}
  <div className="fixed inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-pink/5 pointer-events-none" />

  {/* Content */}
  <div className="relative z-10 container mx-auto p-6">
    <div className="space-y-6">
      {/* Header with gradient text */}
      <div>
        <h1 className="text-4xl font-bold gradient-text">Tasks</h1>
        <p className="text-muted-foreground">Manage your tasks</p>
      </div>

      {/* Glass cards */}
      <div className="grid gap-4">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  </div>
</div>
```

### 10.4 Animations & Transitions

**Button Hover Animation:**
```css
@keyframes pulse-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.button-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

**Page Transition:**
```typescript
"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
```

### 10.5 Loading States

**Skeleton Loader:**
```tsx
<div className="space-y-4">
  {[...Array(5)].map((_, i) => (
    <div key={i} className="glass-card p-4 animate-pulse">
      <div className="h-4 w-3/4 bg-muted rounded" />
      <div className="h-3 w-1/2 bg-muted rounded mt-2" />
    </div>
  ))}
</div>
```

**Spinner:**
```tsx
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon-blue" />
</div>
```

---

## 11. Implementation Checklist

### 11.1 Phase 1: Setup & Theme

- [ ] Initialize Next.js 16+ project with App Router
- [ ] Install dependencies (Tailwind, Shadcn/UI, next-themes, Better Auth)
- [ ] Configure Tailwind with custom cyberpunk theme
- [ ] Create `app/globals.css` with CSS variables
- [ ] Create root layout with ThemeProvider
- [ ] Test theme switcher (dark/light mode)

### 11.2 Phase 2: Authentication

- [ ] Install and configure Better Auth
- [ ] Create Better Auth API route
- [ ] Implement JWT plugin
- [ ] Create LoginForm component
- [ ] Create SignupForm component
- [ ] Create login page (`app/login/page.tsx`)
- [ ] Create signup page (`app/signup/page.tsx`)
- [ ] Implement middleware for route protection
- [ ] Test authentication flow (signup → signin → dashboard)

### 11.3 Phase 3: API Client

- [ ] Create `lib/api-client.ts` with JWT attachment
- [ ] Implement token extraction logic
- [ ] Add 401 error handling
- [ ] Test API calls with JWT

### 11.4 Phase 4: Components

- [ ] Add Shadcn/UI components (Button, Card, Input, etc.)
- [ ] Style components with cyberpunk theme
- [ ] Create TaskCard component
- [ ] Create TaskList component
- [ ] Create TaskTable component
- [ ] Create TaskForm component
- [ ] Create AddTaskDialog component
- [ ] Create EditTaskDialog component
- [ ] Create Navbar component
- [ ] Create Sidebar component
- [ ] Create UserMenu component

### 11.5 Phase 5: Pages

- [ ] Create dashboard layout (protected)
- [ ] Create dashboard page (task list)
- [ ] Create loading state
- [ ] Create 404 page
- [ ] Create error page
- [ ] Test responsive design (mobile, tablet, desktop)

### 11.6 Phase 6: Polish & Deploy

- [ ] Add animations and transitions
- [ ] Test accessibility (keyboard navigation, screen reader)
- [ ] Test cross-browser compatibility
- [ ] Optimize performance (Lighthouse audit)
- [ ] Set up Vercel deployment
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Test production deployment

---

## 12. Success Criteria

### 12.1 Functional Requirements

- [ ] User can sign up with email and password
- [ ] User can sign in with email and password
- [ ] User can sign out
- [ ] User can create tasks (title, description, priority)
- [ ] User can view task list (table on desktop, cards on mobile)
- [ ] User can edit tasks
- [ ] User can delete tasks
- [ ] User can mark tasks as complete
- [ ] User can filter tasks by status
- [ ] User can sort tasks by date/priority
- [ ] All data is scoped to authenticated user

### 12.2 UI/UX Requirements

- [ ] Cyberpunk theme is applied (dark mode default)
- [ ] Neon glows are visible on hover/focus
- [ ] Glassmorphism cards are rendered correctly
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Smooth animations (200ms transitions)
- [ ] High contrast text (WCAG AA)
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible

### 12.3 Performance Requirements

- [ ] Lighthouse score >90
- [ ] First Contentful Paint <1.5s
- [ ] Time to Interactive <3s
- [ ] No console errors
- [ ] No memory leaks

### 12.4 Security Requirements

- [ ] JWT token is attached to all API calls
- [ ] 401 errors redirect to login
- [ ] Protected routes require authentication
- [ ] Better Auth secret is secure
- [ ] No hardcoded secrets in code
- [ ] CORS is configured on backend

---

## 13. Cross-References

**Related Specifications:**
- @constitution.md – Project rules and security requirements
- @specs/ui/theme.md – Theme styling details
- @specs/ui/components.md – Component library specification
- @specs/ui/pages.md – Page layouts and routing
- @specs/features/authentication-frontend.md – Authentication flow

**Skills to Use:**
- `shadcn-ui-cyberpunk-theme-generator` – Generate cyberpunk theme
- `better-auth-jwt-setup` – Configure Better Auth with JWT
- `nextjs-api-client-with-jwt` – Create API client with JWT attachment

**Implementation Order:**
1. Setup & Theme (Phase 1)
2. Authentication (Phase 2)
3. API Client (Phase 3)
4. Components (Phase 4)
5. Pages (Phase 5)
6. Polish & Deploy (Phase 6)

---

**End of specs/frontend-plan.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
