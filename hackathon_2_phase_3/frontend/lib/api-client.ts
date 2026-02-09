import { authClient } from "./auth-client";

class ApiClient {
  private baseURL: string;
  private cachedToken: string | null = null;
  private tokenExpiration: number = 0;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  private async getHeaders(): Promise<Record<string, string>> {
    const token = await this.getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async getToken(): Promise<string | null> {
    try {
      // Check if we have a cached token that's still valid
      if (this.cachedToken && Date.now() < this.tokenExpiration) {
        console.log("=== API Client: Using cached JWT ===");
        return this.cachedToken;
      }

      console.log("=== API Client: Fetching new JWT ===");

      // Fetch a new JWT from our endpoint
      const response = await fetch('/api/auth/token');

      if (!response.ok) {
        console.error("=== API Client: Failed to get JWT ===", response.status);
        return null;
      }

      const data = await response.json();

      if (data.token) {
        this.cachedToken = data.token;
        // Cache for 1 hour (3600000 ms)
        this.tokenExpiration = Date.now() + 3600000;
        console.log("=== API Client: Got new JWT, caching it ===");
        return data.token;
      }

      console.log("=== API Client: No token in response ===");
      return null;
    } catch (error) {
      console.error("=== API Client: Error getting token ===", error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getHeaders();

    try {
      console.log(`=== API Client: ${options?.method || 'GET'} ${url} ===`);
      console.log("=== API Client: Has token:", !!headers["Authorization"]);

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
          console.error("=== API Client: 401 Unauthorized ===");
          // Clear cached token
          this.cachedToken = null;
          this.tokenExpiration = 0;
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("Unauthorized");
        }

        // Parse error response
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || "API request failed");
      }

      console.log(`=== API Client: ${response.status} ${options?.method || 'GET'} ${url} ===`);
      return await response.json();
    } catch (error) {
      console.error("=== API Client: Request failed ===", error);
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
