// api/database/init.js - Initialize database using lib/database.js
import { VercelDatabase } from '../../lib/database.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Test connection first
    const connectionTest = await VercelDatabase.testConnection();
    
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: connectionTest.error,
        suggestion: connectionTest.suggestion
      });
    }

    // Initialize database
    const initResult = await VercelDatabase.initializeDatabase();
    
    return res.status(200).json({
      success: true,
      message: 'Database initialized successfully',
      connectionInfo: connectionTest,
      initResult
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize database',
      error: error.message
    });
  }
}