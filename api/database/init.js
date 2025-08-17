// api/database/init.js - MINIMAL VERSION FOR TESTING
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'CORS OK' });
  }

  try {
    // STEP 1: Just return a basic response to test if API works
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'API endpoint is working!',
        method: req.method,
        timestamp: new Date().toISOString()
      });
    }

    // STEP 2: Check environment variables
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL;
    
    if (!databaseUrl) {
      return res.status(400).json({
        success: false,
        message: 'No database URL found',
        availableEnvVars: Object.keys(process.env).filter(key => 
          key.includes('DATABASE') || key.includes('POSTGRES')
        ),
        nodeEnv: process.env.NODE_ENV
      });
    }

    // STEP 3: Try to import @vercel/postgres
    let sql;
    try {
      const postgres = await import('@vercel/postgres');
      sql = postgres.sql;
    } catch (importError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to import @vercel/postgres',
        error: importError.message,
        suggestion: 'Run: npm install @vercel/postgres'
      });
    }

    // STEP 4: Test basic query
    try {
      const result = await sql`SELECT NOW() as current_time`;
      
      return res.status(200).json({
        success: true,
        message: 'Database connection successful!',
        currentTime: result.rows[0].current_time,
        databaseUrl: databaseUrl.substring(0, 20) + '...' // Hide sensitive info
      });

    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: dbError.message,
        code: dbError.code
      });
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unexpected error',
      error: error.message,
      stack: error.stack
    });
  }
}