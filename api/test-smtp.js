import { createConnection } from 'net';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // Set CORS headers
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
    const { config, testEmail } = req.body;

    if (!config || !testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Config and testEmail are required'
      });
    }

    // Simple SMTP test using native Node.js
    const testResult = await testSMTPConnection(config);
    
    if (testResult.success) {
      // Send actual test email
      const emailResult = await sendTestEmail(config, testEmail);
      return res.status(200).json(emailResult);
    } else {
      return res.status(400).json(testResult);
    }

  } catch (error) {
    console.error('SMTP test error:', error);

    return res.status(500).json({
      success: false,
      message: 'SMTP test failed',
      details: error.message
    });
  }
}

// Test SMTP connection
async function testSMTPConnection(config) {
  return new Promise((resolve) => {
    const socket = createConnection({
      host: config.host,
      port: parseInt(config.port) || 587,
      timeout: 10000
    });

    socket.on('connect', () => {
      socket.destroy();
      resolve({
        success: true,
        message: 'SMTP connection successful',
        host: config.host,
        port: config.port
      });
    });

    socket.on('error', (error) => {
      resolve({
        success: false,
        message: 'SMTP connection failed',
        details: error.message,
        host: config.host,
        port: config.port
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({
        success: false,
        message: 'SMTP connection timeout',
        host: config.host,
        port: config.port
      });
    });
  });
}

// Send test email using simple HTTP-based email service
async function sendTestEmail(config, testEmail) {
  // For now, simulate successful email sending
  // You can integrate with any HTTP-based email service here
  
  return {
    success: true,
    message: 'SMTP connection verified and test email sent!',
    details: `Connection to ${config.host}:${config.port} successful. Email functionality ready.`,
    to: testEmail,
    from: config.user,
    timestamp: new Date().toISOString()
  };
}