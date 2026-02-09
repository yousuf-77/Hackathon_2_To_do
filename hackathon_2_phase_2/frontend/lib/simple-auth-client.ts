// Simple auth client that works with our custom auth API

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  user: User | null;
}

export const simpleAuthClient = {
  async getSession(): Promise<{ data: Session | null; error: any }> {
    try {
      const response = await fetch('/api/simple-auth/session');
      const data = await response.json();

      if (response.ok && data.data) {
        return { data: data.data, error: null };
      }

      return { data: null, error: data.error || { message: 'No session' } };
    } catch (error) {
      console.error('Get session error:', error);
      return { data: null, error: { message: 'Failed to get session' } };
    }
  },

  async signIn(email: string, password: string) {
    const response = await fetch('/api/simple-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  async signUp(email: string, password: string, name: string) {
    const response = await fetch('/api/simple-auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    return response.json();
  },

  async signOut() {
    try {
      await fetch('/api/simple-auth/logout', { method: 'POST' });
      // Redirect to login after logout
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API call fails
      window.location.href = '/login';
    }
  },
};
