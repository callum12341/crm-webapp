// api/email/config.js - Email configuration management.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    if (req.method === 'GET') {
      // Get current email configuration status
      const config = {
        smtp: {
          configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD),
          host: process.env.SMTP_HOST || null,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true',
          user: process.env.SMTP_USER || null
        },
        imap: {
          configured: !!(process.env.IMAP_HOST && process.env.IMAP_USER && process.env.IMAP_PASSWORD),
          host: process.env.IMAP_HOST || null,
          port: process.env.IMAP_PORT || 993,
          secure: process.env.IMAP_SECURE !== 'false',
          user: process.env.IMAP_USER || null
        },
        sendgrid: {
          configured: !!process.env.SENDGRID_API_KEY,
          hasApiKey: !!process.env.SENDGRID_API_KEY
        }
      };

      return res.status(200).json({
        success: true,
        config,
        recommendations: generateRecommendations(config)
      });
    }

    if (req.method === 'POST') {
      // Test email configuration
      const { type, testConfig } = req.body;

      if (type === 'smtp') {
        return await testSMTPConfig(testConfig, res);
      } else if (type === 'imap') {
        return await testIMAPConfig(testConfig, res);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid test type. Use "smtp" or "imap"'
        });
      }
    }

  } catch (error) {
    console.error('Email config error:', error);
    return res.status(500).json({
      success: false,
      message: 'Configuration check failed',
      error: error.message
    });
  }
}

async function testSMTPConfig(config, res) {
  try {
    const { sendSMTPEmail } = await import('../send-email.js');
    
    const testResult = await sendSMTPEmail({
      host: config.host,
      port: parseInt(config.port),
      secure: config.secure,
      user: config.user,
      password: config.password,
      from: config.user,
      to: config.testEmail || config.user,
      subject: 'CRM SMTP Test - Success!',
      text: 'Your SMTP configuration is working correctly.',
      html: '<h3>✅ SMTP Test Successful!</h3><p>Your SMTP configuration is working correctly.</p>'
    });

    return res.status(200).json({
      success: testResult.success,
      message: testResult.success ? 'SMTP configuration is working!' : 'SMTP test failed',
      details: testResult
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'SMTP test failed',
      error: error.message
    });
  }
}

async function testIMAPConfig(config, res) {
  try {
    const { ImapFlow } = await import('imapflow');
    
    const client = new ImapFlow({
      host: config.host,
      port: parseInt(config.port),
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.password
      }
    });

    await client.connect();
    const mailboxes = await client.list();
    await client.logout();

    return res.status(200).json({
      success: true,
      message: 'IMAP configuration is working!',
      mailboxes: mailboxes.slice(0, 5) // Return first 5 mailboxes
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'IMAP test failed',
      error: error.message
    });
  }
}

function generateRecommendations(config) {
  const recommendations = [];

  if (!config.smtp.configured) {
    recommendations.push({
      type: 'warning',
      title: 'SMTP Not Configured',
      message: 'Set up SMTP to send emails from your CRM',
      action: 'Configure SMTP settings in environment variables'
    });
  }

  if (!config.imap.configured) {
    recommendations.push({
      type: 'info',
      title: 'IMAP Not Configured',
      message: 'Set up IMAP to receive and sync emails automatically',
      action: 'Configure IMAP settings for two-way email sync'
    });
  }

  if (config.smtp.configured && config.imap.configured) {
    recommendations.push({
      type: 'success',
      title: 'Full Email Integration Ready',
      message: 'Both SMTP and IMAP are configured for complete email workflow',
      action: 'Set up automatic email sync schedule'
    });
  }

  if (!config.sendgrid.configured && !config.smtp.configured) {
    recommendations.push({
      type: 'error',
      title: 'No Email Service Configured',
      message: 'Configure either SMTP or SendGrid to send emails',
      action: 'Add email service credentials to environment variables'
    });
  }

  return recommendations;
}