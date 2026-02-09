import { Pool } from 'pg';

// Create PostgreSQL connection pool for Better Auth
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export { pool };
