const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('Connecting to Neon database...');
    const client = await pool.connect();
    console.log('Connected!');

    const sqlPath = path.join(__dirname, 'migrations', '001_init_better_auth.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Executing migration...');
    await client.query(sql);
    console.log('✅ Migration completed successfully!');

    client.release();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
