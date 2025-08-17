// api/debug-imap.js - Debug IMAP configuration
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    // Check all environment variables
    const envVars = {
      IMAP_HOST: process.env.IMAP_HOST || 'NOT_SET',
      IMAP_PORT: process.env.IMAP_PORT || 'NOT_SET',
      IMAP_USER: process.env.IMAP_USER || 'NOT_SET',
      IMAP_PASSWORD: process.env.IMAP_PASSWORD ? 'SET (hidden)' : 'NOT_SET',
      IMAP_SECURE: process.env.IMAP_SECURE || 'NOT_SET'
    };

    // Check if imapflow is available
    let imapAvailable = false;
    try {
      await import('imapflow');
      imapAvailable = true;
    } catch (error) {
      console.log('ImapFlow import error:', error.message);
    }

    return res.status(200).json({
      success: true,
      message: 'IMAP Debug Information',
      environmentVariables: envVars,
      imapLibraryAvailable: imapAvailable,
      nodeEnv: process.env.NODE_ENV,
      platform: process.platform,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}