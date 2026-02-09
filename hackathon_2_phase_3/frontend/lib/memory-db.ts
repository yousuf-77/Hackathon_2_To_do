// In-memory database for Better Auth
// This persists users for the lifetime of the server process

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  token: string;
  createdAt: string;
  updatedAt: string;
}

interface Account {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  password: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Verification {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: string;
  updatedAt: string;
}

export const memoryDB = {
  user: [] as User[],
  session: [] as Session[],
  account: [] as Account[],
  verification: [] as Verification[],
};
