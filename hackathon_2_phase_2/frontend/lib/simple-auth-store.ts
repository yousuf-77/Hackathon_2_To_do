// Simple in-memory user store for development
// This stores users in memory since Better Auth requires a database

import { cookies } from 'next/headers';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
}

// In-memory storage (will be lost on server restart)
const users = new Map<string, User & { password: string }>();
const sessions = new Map<string, Session>();

export function createUser(email: string, password: string, name: string): User {
  const id = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const user: User & { password: string } = {
    id,
    email,
    password,
    name,
    createdAt: new Date().toISOString(),
  };
  users.set(email, user);
  return { id, email, name, createdAt: user.createdAt };
}

export function findUser(email: string): (User & { password: string }) | undefined {
  return users.get(email);
}

export function createSession(userId: string, token: string): Session {
  const user = Array.from(users.values()).find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  const session: Session = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    },
    token,
  };
  sessions.set(token, session);
  return session;
}

export function getSession(token: string): Session | undefined {
  return sessions.get(token);
}

export function deleteSession(token: string): void {
  sessions.delete(token);
}
