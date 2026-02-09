# specs/features/authentication-frontend.md

## Frontend Authentication Feature Specification

**Status:** Draft | **Priority:** Critical | **Dependencies:** @constitution.md Section 2, @specs/ui/pages.md, @specs/ui/components.md

---

## Overview

Define the complete frontend authentication flow for the Hackathon II Phase II Todo web application using Better Auth with JWT plugin. This specification covers installation, configuration, UI components, and JWT token management for API calls.

**Authentication Architecture (from @constitution.md):**
```
1. User signs up/in via Better Auth (frontend)
2. Better Auth JWT plugin issues JWT token
3. Token stored in secure HTTP-only cookie or localStorage
4. Frontend attaches token to all backend API calls: Authorization: Bearer <token>
```

**Skills to Use:**
- `better-auth-jwt-setup` – Configure Better Auth with JWT plugin
- `nextjs-api-client-with-jwt` – Create API client with JWT attachment

---

## 1. Installation & Setup

### 1.1 Install Better Auth

**Command:**
```bash
npm install better-auth
```

**Version:** Latest (check https://www.better-auth.com)

### 1.2 Configure Better Auth

**File:** `lib/auth.ts`

**Purpose:** Initialize Better Auth with JWT plugin

**Code Structure:**
```typescript
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [
    jwt({
      // JWT configuration
      issuer: "hackathon-todo",
      audience: "hackathon-todo-api",
      expiresIn: 60 * 60 * 24 * 7, // 7 days
    }),
  ],
  // Email/password provider
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Skip for hackathon
  },
});
```

**Environment Variables:**
```bash
# .env.local
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars
```

### 1.3 Create Better Auth API Route

**File:** `app/api/auth/[...auth]/route.ts`

**Purpose:** Next.js App Router API route for Better Auth

**Code Structure:**
```typescript
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**Acceptance Criteria:**
- [ ] Better Auth is installed and configured
- [ ] JWT plugin is enabled
- [ ] API route is created at `/api/auth/[...auth]/route.ts`
- [ ] Environment variables are set

---

## 2. Authentication Flow

### 2.1 Sign Up Flow

**Steps:**
1. User navigates to `/signup`
2. User fills out signup form (name, email, password, confirm password)
3. Client validates form (email format, passwords match)
4. Client calls `auth.signUp.email()` with email and password
5. Better Auth creates user account and issues JWT token
6. Token is stored in HTTP-only cookie
7. User is redirected to `/dashboard`

**Client-Side Code:**
```typescript
// components/auth/signup-form.tsx
import { auth } from "@/lib/auth";

async function handleSignUp(data: SignUpData) {
  try {
    const user = await auth.signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (user.error) {
      toast({
        title: "Sign up failed",
        description: user.error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Account created",
      description: "Welcome to Hackathon Todo!",
      variant: "success",
    });

    // Redirect to dashboard (Better Auth handles this automatically)
    router.push("/dashboard");
  } catch (error) {
    toast({
      title: "Sign up failed",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
  }
}
```

**Acceptance Criteria:**
- [ ] User can sign up with email and password
- [ ] Form validates email format
- [ ] Form validates passwords match
- [ ] Success shows toast and redirects to /dashboard
- [ ] Error shows toast with error message
- [ ] JWT token is stored in cookie after signup

### 2.2 Sign In Flow

**Steps:**
1. User navigates to `/login`
2. User fills out login form (email, password)
3. Client validates form (email format, password not empty)
4. Client calls `auth.signIn.email()` with email and password
5. Better Auth verifies credentials and issues JWT token
6. Token is stored in HTTP-only cookie
7. User is redirected to `/dashboard`

**Client-Side Code:**
```typescript
// components/auth/login-form.tsx
import { auth } from "@/lib/auth";

async function handleSignIn(data: SignInData) {
  try {
    const user = await auth.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (user.error) {
      toast({
        title: "Sign in failed",
        description: user.error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Welcome back!",
      description: "You are now signed in",
      variant: "success",
    });

    // Redirect to dashboard (Better Auth handles this automatically)
    router.push("/dashboard");
  } catch (error) {
    toast({
      title: "Sign in failed",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
  }
}
```

**Acceptance Criteria:**
- [ ] User can sign in with email and password
- [ ] Form validates email format
- [ ] Success shows toast and redirects to /dashboard
- [ ] Error shows toast with error message
- [ ] JWT token is stored in cookie after signin

### 2.3 Sign Out Flow

**Steps:**
1. User clicks logout button in user menu
2. Client calls `auth.signOut()`
3. Better Auth clears session and removes JWT token
4. User is redirected to `/login`

**Client-Side Code:**
```typescript
// components/auth/user-menu.tsx
import { auth } from "@/lib/auth";

async function handleSignOut() {
  try {
    await auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
      variant: "success",
    });
    router.push("/login");
  } catch (error) {
    toast({
      title: "Sign out failed",
      description: "An unexpected error occurred",
      variant: "destructive",
    });
  }
}
```

**Acceptance Criteria:**
- [ ] User can sign out by clicking logout button
- [ ] JWT token is cleared from cookies
- [ ] User is redirected to /login
- [ ] Success toast is shown

### 2.4 Session Management

**Get Current Session:**
```typescript
import { auth } from "@/lib/auth";

// Server Component
const session = await auth();

// Client Component
const session = await auth.getClient(); // or use useSession hook
```

**Session Hook (Client Component):**
```typescript
// hooks/use-session.ts
import { useSession } from "better-auth/react"; // or custom hook

export function useSession() {
  const session = auth.useSession();
  return session;
}
```

**Acceptance Criteria:**
- [ ] Server components can access session via `await auth()`
- [ ] Client components can access session via hook
- [ ] Session includes user object (id, email, name)
- [ ] Session is null if user is not authenticated

---

## 3. JWT Token Management

### 3.1 Extract JWT Token

**Purpose:** Get JWT token from Better Auth session for API calls

**Server-Side (Server Components):**
```typescript
import { auth } from "@/lib/auth";

export async function getToken(): Promise<string | null> {
  const session = await auth();

  if (!session) {
    return null;
  }

  // Better Auth JWT plugin stores token in session
  return session.token || null;
}
```

**Client-Side (Client Components):**
```typescript
import { auth } from "@/lib/auth";

export async function getClientToken(): Promise<string | null> {
  const session = await auth.getClient();

  if (!session) {
    return null;
  }

  return session.token || null;
}
```

**Alternative (Parse from Cookie):**
```typescript
export function getTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");
  const sessionCookie = cookies.find((cookie) =>
    cookie.trim().startsWith("better-auth.session_token")
  );

  if (!sessionCookie) return null;

  // Decode JWT token (you may need to parse session cookie)
  return sessionCookie.split("=")[1];
}
```

**Acceptance Criteria:**
- [ ] Token can be extracted from session
- [ ] Token is null if user is not authenticated
- [ ] Token is a valid JWT string

### 3.2 Attach JWT to API Calls

**Purpose:** Create API client that auto-adds JWT to requests

**Skill to Use:** `nextjs-api-client-with-jwt`

**File:** `lib/api-client.ts`

**Code Structure:**
```typescript
import { auth } from "@/lib/auth";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  detail?: string;
}

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
    // Client-side token extraction
    const session = await auth.getClient();
    return session?.token || null;
  }

  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // Handle 401 Unauthorized (token expired or invalid)
        if (response.status === 401) {
          // Redirect to login
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
      // Show error toast (optional)
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

**Acceptance Criteria:**
- [ ] ApiClient is singleton instance
- [ ] All methods auto-attach JWT token
- [ ] 401 errors redirect to /login
- [ ] Errors are thrown with descriptive messages
- [ ] Base URL from env variable

### 3.3 Usage Example

**Fetch Tasks:**
```typescript
import { apiClient } from "@/lib/api-client";

interface Task {
  id: string;
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
async function createTask(userId: string, data: CreateTaskData): Promise<Task> {
  return apiClient.post<Task>(`/api/${userId}/tasks`, data);
}
```

**Update Task:**
```typescript
async function updateTask(userId: string, taskId: string, data: UpdateTaskData): Promise<Task> {
  return apiClient.put<Task>(`/api/${userId}/tasks/${taskId}`, data);
}
```

**Delete Task:**
```typescript
async function deleteTask(userId: string, taskId: string): Promise<void> {
  return apiClient.delete(`/api/${userId}/tasks/${taskId}`);
}
```

---

## 4. Protected Routes

### 4.1 Server-Side Protection

**File:** `app/dashboard/layout.tsx`

**Code:**
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

**Acceptance Criteria:**
- [ ] Unauthenticated users are redirected to /login
- [ ] Authenticated users can access protected routes
- [ ] Redirect happens server-side (no flash)

### 4.2 Middleware Protection

**File:** `middleware.ts`

**Code:**
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

**Acceptance Criteria:**
- [ ] Middleware intercepts all routes
- [ ] Public routes are accessible without auth
- [ ] Protected routes require auth
- [ ] Unauthenticated users redirect to /login

### 4.3 Client-Side Protection (Optional)

**Hook:**
```typescript
// hooks/use-require-auth.ts
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

## 5. UI Components

### 5.1 LoginForm

**File:** `components/auth/login-form.tsx`

**Type:** Client Component

**Full Spec:** See @specs/ui/components.md Section 5.1

**Key Features:**
- Email and password fields
- Form validation
- Call `auth.signIn.email()`
- Show success/error toasts
- Redirect to /dashboard on success

### 5.2 SignupForm

**File:** `components/auth/signup-form.tsx`

**Type:** Client Component

**Full Spec:** See @specs/ui/components.md Section 5.2

**Key Features:**
- Name, email, password, confirm password fields
- Form validation (passwords match)
- Call `auth.signUp.email()`
- Show success/error toasts
- Redirect to /dashboard on success

### 5.3 UserMenu

**File:** `components/auth/user-menu.tsx`

**Type:** Client Component

**Full Spec:** See @specs/ui/components.md Section 4.3

**Key Features:**
- Avatar dropdown menu
- Show user email
- Logout button calls `auth.signOut()`
- Redirect to /login after logout

---

## 6. Environment Variables

### 6.1 Required Variables

```bash
# .env.local
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-super-secret-key-min-32-chars

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 6.2 Production Variables

```bash
# .env.production
NEXT_PUBLIC_BETTER_AUTH_URL=https://hackathon-todo.vercel.app
BETTER_AUTH_SECRET=production-secret-min-32-chars
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Acceptance Criteria:**
- [ ] All env variables are set
- [ ] BETTER_AUTH_SECRET is at least 32 characters
- [ ] Secrets are never committed to git
- [ ] .env.example is provided for other developers

---

## 7. Error Handling

### 7.1 Authentication Errors

**Sign In Errors:**
- Invalid email/password → Show error toast
- User not found → Show error toast with link to signup
- Network error → Show error toast

**Sign Up Errors:**
- Email already exists → Show error toast with link to login
- Weak password → Show error toast
- Network error → Show error toast

### 7.2 API Errors (401 Unauthorized)

**Handling:**
```typescript
// In api-client.ts
if (response.status === 401) {
  // Token expired or invalid
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  throw new Error("Unauthorized");
}
```

**Acceptance Criteria:**
- [ ] 401 errors redirect to /login
- [ ] Error toasts are user-friendly
- [ ] Network errors are caught and displayed

---

## 8. Testing Checklist

### 8.1 Sign Up Flow

- [ ] User can navigate to /signup
- [ ] Form validates email format
- [ ] Form validates passwords match
- [ ] Submitting creates user account
- [ ] JWT token is issued and stored
- [ ] User is redirected to /dashboard
- [ ] User is logged in after signup

### 8.2 Sign In Flow

- [ ] User can navigate to /login
- [ ] Form validates email format
- [ ] Submitting with valid credentials signs in
- [ ] JWT token is issued and stored
- [ ] User is redirected to /dashboard
- [ ] Submitting with invalid credentials shows error

### 8.3 Sign Out Flow

- [ ] User can click logout button
- [ ] Session is cleared
- [ ] JWT token is removed
- [ ] User is redirected to /login
- [ ] User cannot access protected routes after logout

### 8.4 Protected Routes

- [ ] Unauthenticated user cannot access /dashboard
- [ ] Unauthenticated user is redirected to /login
- [ ] Authenticated user can access /dashboard
- [ ] Session persists across page refreshes

### 8.5 JWT Token Management

- [ ] Token is attached to all API calls
- [ ] 401 errors redirect to /login
- [ ] Token expires after 7 days (configurable)
- [ ] Token is refreshed automatically (if implemented)

### 8.6 API Integration

- [ ] ApiClient is configured with correct base URL
- [ ] ApiClient attaches JWT to all requests
- [ ] ApiClient handles 401 errors
- [ ] ApiClient throws errors with descriptive messages

---

## 9. Security Considerations

### 9.1 Token Storage

**Preferred:** HTTP-only, secure cookie
- Better Auth default: HTTP-only cookie
- Secure flag: true (HTTPS only)
- SameSite: strict (CSRF protection)

**Fallback:** localStorage (with XSS protection)
- Only if cookies are not available
- Sanitize all user input to prevent XSS
- Use Content Security Policy (CSP)

### 9.2 Token Expiration

**Default:** 7 days
```typescript
jwt({
  expiresIn: 60 * 60 * 24 * 7, // 7 days
})
```

**Configurable:** Environment variable
```typescript
const expiresIn = parseInt(process.env.JWT_EXPIRATION_DAYS || "7") * 24 * 60 * 60;
```

### 9.3 Secret Management

**Requirements:**
- Minimum 32 characters
- Cryptographically random
- Same across frontend and backend
- Never commit to git
- Rotate in production

**Generation:**
```bash
openssl rand -base64 32
```

### 9.4 Cross-Site Scripting (XSS) Prevention

- Sanitize all user input
- Use React's built-in XSS protection (escaping)
- Implement Content Security Policy (CSP)
- Validate data on backend

### 9.5 Cross-Site Request Forgery (CSRF) Prevention

- Use SameSite=strict for cookies
- Better Auth handles CSRF tokens automatically
- Validate origin on backend

---

## 10. Cross-References

**Related Specifications:**
- @constitution.md Section 2 – Security & authentication rules
- @specs/ui/components.md Section 5 – Auth UI components
- @specs/ui/pages.md Section 4-6 – Auth pages

**Skills to Use:**
- `better-auth-jwt-setup` – Configure Better Auth with JWT plugin
- `nextjs-api-client-with-jwt` – Create API client with JWT attachment

**Implementation Order:**
1. Install Better Auth
2. Configure Better Auth with JWT plugin
3. Create API route at `/api/auth/[...auth]/route.ts`
4. Create LoginForm and SignupForm components
5. Create API client with JWT attachment
6. Implement protected routes (layout + middleware)
7. Test all auth flows (signup, signin, signout)
8. Test API integration with JWT

---

## 11. Bonus Features (Optional)

### 11.1 Social Auth (Google, GitHub)

- Implement OAuth providers
- Add "Sign in with Google" button
- Add "Sign in with GitHub" button

### 11.2 Email Verification

- Require email verification before signup
- Send verification email
- Verify email on click

### 11.3 Password Reset

- Add "Forgot password" link
- Send reset email
- Reset password with token

### 11.4 Remember Me

- Extend token expiry (30 days)
- Checkbox in login form
- Persistent session across browser restarts

### 11.5 Two-Factor Authentication (2FA)

- Add TOTP (Time-based One-Time Password)
- Require 2FA for sensitive actions
- Backup codes for recovery

---

**End of specs/features/authentication-frontend.md**

**Version:** 1.0 | **Last Updated:** 2025-02-08 | **Status:** Draft
