// Test Neon connection
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = "postgresql://neondb_owner:npg_Wo4kT5FNPYwI@ep-small-sky-aiqcqk8o-pooler.c-4.us-east-1.aws.neon.tech/neondb";
const sql = neon(DATABASE_URL);

async function testConnection() {
  try {
    console.log('DATABASE_URL:', DATABASE_URL.substring(0, 50) + '...');
    console.log('Testing Neon connection...');
    const result = await sql`SELECT NOW()`;
    console.log('✅ Neon connected:', result);
  } catch (error) {
    console.error('❌ Neon connection failed:', error);
  }
}

testConnection();
