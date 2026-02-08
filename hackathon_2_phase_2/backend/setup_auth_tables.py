import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def setup_auth_tables():
    """Create Better Auth tables in Neon PostgreSQL"""
    conn = await asyncpg.connect(DATABASE_URL)

    try:
        # Create users table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS user_table (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                email_verified BOOLEAN DEFAULT FALSE,
                image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create sessions table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS session (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES user_table(id) ON DELETE CASCADE,
                expires_at TIMESTAMP NOT NULL,
                token TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create accounts table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS account (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES user_table(id) ON DELETE CASCADE,
                account_id TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                access_token TEXT,
                refresh_token TEXT,
                id_token TEXT,
                expires_at TIMESTAMP,
                password TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(account_id, provider_id)
            )
        """)

        # Create verifications table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS verification (
                id TEXT PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("✅ Better Auth tables created successfully!")

        # Show created tables
        tables = await conn.fetch("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('user_table', 'session', 'account', 'verification')
            ORDER BY table_name
        """)

        print("\n📋 Created tables:")
        for table in tables:
            print(f"  - {table['table_name']}")

    except Exception as e:
        print(f"❌ Error creating tables: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(setup_auth_tables())
