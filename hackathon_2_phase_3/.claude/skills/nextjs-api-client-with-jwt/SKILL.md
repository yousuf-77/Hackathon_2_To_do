---
name: nextjs-api-client-with-jwt
description: |
  This skill guides Claude Code to spec and implement a secure, reusable API client in Next.js (using fetch or axios) that automatically attaches JWT Bearer token from Better Auth session to every API request header. Includes error handling (401 redirect to login), token refresh if applicable, typing with TypeScript, env var for backend URL, and user-scoped Todo CRUD calls for Hackathon II Phase II. This skill activates automatically when users ask for Next.js API client, fetch/axios wrapper, attaching JWT to headers, secure API calls from frontend, or frontend-backend integration in Todo web app.
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

# Next.js API Client with JWT Skill

## Overview
This skill provides comprehensive guidance for creating a secure, reusable API client in Next.js that handles JWT authentication with Better Auth. It covers both fetch and axios implementations with automatic token attachment, error handling, and proper TypeScript typing.

## When to Use This Skill
- Creating a centralized API client for Next.js applications
- Implementing JWT token authentication with Better Auth
- Handling 401 unauthorized responses with proper redirects
- Implementing token refresh mechanisms
- Creating user-scoped API calls for Todo applications
- Establishing secure frontend-backend communication
- Building type-safe API interactions with TypeScript

## Before Implementation

Gather context to ensure successful implementation:

| Source | Gather |
|--------|--------|
| **Codebase** | Existing auth setup, Better Auth integration, current API patterns, environment variable structure |
| **Conversation** | User's preference for fetch vs axios, specific error handling requirements, token refresh needs |
| **Skill References** | Next.js app router patterns, Better Auth session handling, TypeScript best practices |
| **User Guidelines** | Project-specific API URL patterns, authentication requirements, team coding standards |

Ensure all required context is gathered before implementing.

## Core Implementation Patterns

### 1. API Client Configuration
```typescript
// lib/api-client/config.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
} as const;

export type ApiConfig = typeof API_CONFIG;
```

### 2. TypeScript Interfaces
```typescript
// types/api.ts
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TodoCreate {
  title: string;
  description?: string;
  completed?: boolean;
}

export interface TodoUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 3. Fetch-Based API Client Implementation
```typescript
// lib/api-client/fetch-client.ts
import { API_CONFIG } from './config';
import { ApiResponse, Todo, TodoCreate, TodoUpdate, PaginationParams, PaginatedResponse } from '../../types/api';

class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config = API_CONFIG) {
    this.baseUrl = config.BASE_URL;
    this.timeout = config.TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Prepare headers
    let headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if required
    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else {
        // Redirect to login if no token
        this.handleUnauthorized();
        throw new Error('No authentication token available');
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('Unauthorized: Please log in again');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  private async getAuthToken(): Promise<string | null> {
    // Get token from Better Auth session or localStorage
    if (typeof window !== 'undefined') {
      // Try to get from Better Auth session first
      try {
        const { getSession } = await import('@better-auth/client');
        const session = await getSession();
        return session?.accessToken || localStorage.getItem('auth_token');
      } catch {
        // Fallback to localStorage
        return localStorage.getItem('auth_token');
      }
    }
    return null;
  }

  private handleUnauthorized(): void {
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Generic methods
  get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${queryString}`, { method: 'GET' });
  }

  post<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T, D = unknown>(endpoint: string, data?: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Specific API methods for Todo operations
  getTodos(params?: PaginationParams): Promise<PaginatedResponse<Todo>> {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = params.page.toString();
    if (params?.limit) queryParams.limit = params.limit.toString();
    if (params?.sortBy) queryParams.sortBy = params.sortBy;
    if (params?.sortOrder) queryParams.sortOrder = params.sortOrder;

    return this.get<PaginatedResponse<Todo>>('/todos', queryParams);
  }

  getTodo(id: number): Promise<ApiResponse<Todo>> {
    return this.get<ApiResponse<Todo>>(`/todos/${id}`);
  }

  createTodo(todo: TodoCreate): Promise<ApiResponse<Todo>> {
    return this.post<ApiResponse<Todo>, TodoCreate>('/todos', todo);
  }

  updateTodo(id: number, todo: TodoUpdate): Promise<ApiResponse<Todo>> {
    return this.put<ApiResponse<Todo>, TodoUpdate>(`/todos/${id}`, todo);
  }

  deleteTodo(id: number): Promise<ApiResponse<boolean>> {
    return this.delete<ApiResponse<boolean>>(`/todos/${id}`);
  }

  toggleTodoCompletion(id: number): Promise<ApiResponse<Todo>> {
    return this.patch<ApiResponse<Todo>>(`/todos/${id}/toggle`);
  }
}

// Singleton instance
export const apiClient = new ApiClient();

export default apiClient;
```

### 4. Axios-Based API Client Implementation (Alternative)
```typescript
// lib/api-client/axios-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from './config';
import { ApiResponse, Todo, TodoCreate, TodoUpdate, PaginationParams, PaginatedResponse } from '../../types/api';

class AxiosApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle 401 errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      try {
        const { getSession } = await import('@better-auth/client');
        const session = await getSession();
        return session?.accessToken || localStorage.getItem('auth_token');
      } catch {
        return localStorage.getItem('auth_token');
      }
    }
    return null;
  }

  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Generic methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.get<T>(url, config);
  }

  async post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.post<T>(url, data, config);
  }

  async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.put<T>(url, data, config);
  }

  async patch<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.patch<T>(url, data, config);
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.client.delete<T>(url, config);
  }

  // Specific API methods for Todo operations
  async getTodos(params?: PaginationParams): Promise<AxiosResponse<PaginatedResponse<Todo>>> {
    return this.client.get<PaginatedResponse<Todo>>('/todos', { params });
  }

  async getTodo(id: number): Promise<AxiosResponse<ApiResponse<Todo>>> {
    return this.client.get<ApiResponse<Todo>>(`/todos/${id}`);
  }

  async createTodo(todo: TodoCreate): Promise<AxiosResponse<ApiResponse<Todo>>> {
    return this.client.post<ApiResponse<Todo>>('/todos', todo);
  }

  async updateTodo(id: number, todo: TodoUpdate): Promise<AxiosResponse<ApiResponse<Todo>>> {
    return this.client.put<ApiResponse<Todo>>(`/todos/${id}`, todo);
  }

  async deleteTodo(id: number): Promise<AxiosResponse<ApiResponse<boolean>>> {
    return this.client.delete<ApiResponse<boolean>>(`/todos/${id}`);
  }

  async toggleTodoCompletion(id: number): Promise<AxiosResponse<ApiResponse<Todo>>> {
    return this.client.patch<ApiResponse<Todo>>(`/todos/${id}/toggle`);
  }
}

export const axiosApiClient = new AxiosApiClient();
export default axiosApiClient;
```

### 5. Better Auth Integration Hook
```typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@better-auth/react';
import apiClient from '@/lib/api-client/fetch-client';
import { ApiResponse, Todo, TodoCreate, TodoUpdate, PaginationParams, PaginatedResponse } from '../types/api';

export const useApi = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeWithErrorHandling = async <T,>(
    apiCall: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Todo operations with error handling
  const getTodos = async (params?: PaginationParams) => {
    return executeWithErrorHandling(() => apiClient.getTodos(params));
  };

  const getTodo = async (id: number) => {
    return executeWithErrorHandling(() => apiClient.getTodo(id));
  };

  const createTodo = async (todo: TodoCreate) => {
    return executeWithErrorHandling(() => apiClient.createTodo(todo));
  };

  const updateTodo = async (id: number, todo: TodoUpdate) => {
    return executeWithErrorHandling(() => apiClient.updateTodo(id, todo));
  };

  const deleteTodo = async (id: number) => {
    return executeWithErrorHandling(() => apiClient.deleteTodo(id));
  };

  const toggleTodoCompletion = async (id: number) => {
    return executeWithErrorHandling(() => apiClient.toggleTodoCompletion(id));
  };

  return {
    session,
    loading,
    error,
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion,
    executeWithErrorHandling,
  };
};
```

### 6. Context Provider for Global API State
```typescript
// contexts/ApiContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { useApi } from '../hooks/useApi';
import { Todo, TodoCreate, TodoUpdate, PaginationParams, PaginatedResponse } from '../types/api';

interface ApiContextType {
  loading: boolean;
  error: string | null;
  getTodos: (params?: PaginationParams) => Promise<PaginatedResponse<Todo> | null>;
  getTodo: (id: number) => Promise<Todo | null>;
  createTodo: (todo: TodoCreate) => Promise<Todo | null>;
  updateTodo: (id: number, todo: TodoUpdate) => Promise<Todo | null>;
  deleteTodo: (id: number) => Promise<boolean | null>;
  toggleTodoCompletion: (id: number) => Promise<Todo | null>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const apiHook = useApi();

  return (
    <ApiContext.Provider value={apiHook}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};
```

### 7. Environment Variables Configuration
```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000/api/auth
```

### 8. Usage Examples
```typescript
// components/TodoList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useApiContext } from '@/contexts/ApiContext';
import { Todo } from '@/types/api';

const TodoList: React.FC = () => {
  const { getTodos, loading, error } = useApiContext();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchTodos = async () => {
      const response = await getTodos({ page: currentPage, limit: 10 });
      if (response) {
        setTodos(response.data);
      }
    };

    fetchTodos();
  }, [currentPage]);

  if (loading) return <div>Loading todos...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      {todos.map(todo => (
        <div key={todo.id} className="p-4 border rounded-lg">
          <h3 className={todo.completed ? 'line-through text-gray-500' : ''}>
            {todo.title}
          </h3>
          {todo.description && <p className="text-gray-600">{todo.description}</p>}
        </div>
      ))}
    </div>
  );
};

export default TodoList;
```

### 9. Custom Hook for Specific API Operations
```typescript
// hooks/useTodos.ts
import { useState, useEffect } from 'react';
import { useApiContext } from '@/contexts/ApiContext';
import { Todo, TodoCreate, TodoUpdate } from '@/types/api';

export const useTodos = () => {
  const {
    getTodos,
    getTodo,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion,
    loading,
    error
  } = useApiContext();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load todos on mount
  useEffect(() => {
    const loadTodos = async () => {
      const response = await getTodos({ limit: 50 });
      if (response) {
        setTodos(response.data);
      }
      setIsInitialized(true);
    };

    loadTodos();
  }, []);

  const refreshTodos = async () => {
    const response = await getTodos({ limit: 50 });
    if (response) {
      setTodos(response.data);
    }
  };

  const addTodo = async (todoData: TodoCreate) => {
    const newTodo = await createTodo(todoData);
    if (newTodo) {
      setTodos(prev => [...prev, newTodo]);
      return newTodo;
    }
    return null;
  };

  const editTodo = async (id: number, todoData: TodoUpdate) => {
    const updatedTodo = await updateTodo(id, todoData);
    if (updatedTodo) {
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      if (selectedTodo?.id === id) {
        setSelectedTodo(updatedTodo);
      }
      return updatedTodo;
    }
    return null;
  };

  const removeTodo = async (id: number) => {
    const success = await deleteTodo(id);
    if (success) {
      setTodos(prev => prev.filter(t => t.id !== id));
      if (selectedTodo?.id === id) {
        setSelectedTodo(null);
      }
      return true;
    }
    return false;
  };

  const toggleCompletion = async (id: number) => {
    const updatedTodo = await toggleTodoCompletion(id);
    if (updatedTodo) {
      setTodos(prev => prev.map(t => t.id === id ? updatedTodo : t));
      if (selectedTodo?.id === id) {
        setSelectedTodo(updatedTodo);
      }
      return updatedTodo;
    }
    return null;
  };

  const selectTodo = (id: number) => {
    const todo = todos.find(t => t.id === id);
    setSelectedTodo(todo || null);
  };

  return {
    todos,
    selectedTodo,
    loading,
    error,
    isInitialized,
    refreshTodos,
    addTodo,
    editTodo,
    removeTodo,
    toggleCompletion,
    selectTodo,
  };
};
```

## Error Handling Best Practices

### 1. Centralized Error Handling
```typescript
// lib/api-client/error-handler.ts
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  originalError?: Error;
  statusCode?: number;
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: ApiErrorCode.NETWORK_ERROR,
      message: 'Network connection failed',
      originalError: error as Error,
    };
  }

  if (error instanceof Error && error.name === 'AbortError') {
    return {
      code: ApiErrorCode.TIMEOUT,
      message: 'Request timed out',
      originalError: error,
    };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('401') || message.includes('unauthorized')) {
      return {
        code: ApiErrorCode.UNAUTHORIZED,
        message: 'Unauthorized access. Please log in again.',
        originalError: error,
        statusCode: 401,
      };
    }

    return {
      code: ApiErrorCode.UNKNOWN_ERROR,
      message: error.message,
      originalError: error,
    };
  }

  return {
    code: ApiErrorCode.UNKNOWN_ERROR,
    message: 'An unknown error occurred',
    originalError: error as Error,
  };
};
```

### 2. Retry Logic
```typescript
// lib/api-client/retry-mechanism.ts
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }

  throw new Error('Retry mechanism failed');
};
```

## Security Considerations

### 1. Secure Token Storage
```typescript
// utils/token-storage.ts
const TOKEN_KEY = 'auth_token';

export const tokenStorage = {
  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      // Store in localStorage for persistence across tabs
      localStorage.setItem(TOKEN_KEY, token);
      // Also store in sessionStorage as backup
      sessionStorage.setItem(TOKEN_KEY, token);
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
    }
  },
};
```

### 2. CSRF Protection
```typescript
// lib/api-client/csrf-protection.ts
export const getCsrfToken = async (): Promise<string> => {
  // Get CSRF token from Better Auth or your CSRF endpoint
  try {
    const response = await fetch('/api/csrf');
    const data = await response.json();
    return data.csrfToken;
  } catch {
    // Generate a random token as fallback
    return crypto.randomUUID();
  }
};
```

## Quality Assurance Checklist

- [ ] API client properly configured with environment variables
- [ ] JWT token automatically attached to requests
- [ ] 401 errors handled with redirect to login
- [ ] TypeScript interfaces properly defined for all API responses
- [ ] Error handling implemented for network failures
- [ ] Loading and error states managed properly
- [ ] Context provider implemented for global state
- [ ] Custom hooks created for specific functionality
- [ ] Security best practices followed (secure token storage)
- [ ] Token refresh mechanism implemented if needed
- [ ] Timeout handling configured
- [ ] Retry logic implemented for transient failures
- [ ] All Todo CRUD operations properly implemented
- [ ] Proper typing for request/response objects
- [ ] Environment variables properly configured

## References and Further Reading

- Next.js Data Fetching: https://nextjs.org/docs/app/building-your-application/data-fetching
- Better Auth Documentation: https://better-auth.com/docs
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- Axios Documentation: https://axios-http.com/docs/intro
- React Query/SWR: For advanced data fetching and caching patterns
- OWASP Secure Coding: https://owasp.org/www-project-secure-coding-dojo/
- JWT Best Practices: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html