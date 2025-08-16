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
    // Try multiple ways to import nodemailer
    let createTransporter;
    
    try {
      // Method 1: Standard dynamic import
      const nodemailerModule = await import('nodemailer');
      console.log('Nodemailer module:', Object.keys(nodemailerModule));
      
      if (nodemailerModule.createTransporter) {
        createTransporter = nodemailerModule.createTransporter;
      } else if (nodemailerModule.default && nodemailerModule.default.createTransporter) {
        createTransporter = nodemailerModule.default.createTransporter;
      } else if (nodemailerModule.default && typeof nodemailerModule.default === 'function') {
        createTransporter = nodemailerModule.default;
      } else {
        // Try to find createTransporter in any property
        for (const key of Object.keys(nodemailerModule)) {
          if (nodemailerModule[key] && nodemailerModule[key].createTransporter) {
            createTransporter = nodemailerModule[key].createTransporter;
            break;
          }
        }
      }
    } catch (importError) {
      console.error('Import error:', importError);
      return res.status(500).json({
        success: false,
        message: 'Failed to import nodemailer',
        details: importError.message
      });
    }

    if (!createTransporter) {
      return res.status(500).json({
        success: false,
        message: 'Could not find createTransporter function',
        details: 'Nodemailer module structure is unexpected'
      });
    }
    
    const { config, testEmail } = req.body;

    if (!config || !testEmail) {
      return res.status(400).json({
        success: false,
        message: 'Config and testEmail are required'
      });
    }

    // Create test transporter with provided config
    const testTransporter = createTransporter({
      host: config.host,
      port: parseInt(config.port) || 587,
      secure: config.secure === true || config.secure === 'true',
      auth: {
        user: config.user,
        pass: config.password
      }
    });

    // Verify connection
    console.log('Testing SMTP connection...');
    await testTransporter.verify();
    console.log('SMTP connection verified');

    // Send test email
    const info = await testTransporter.sendMail({
      from: config.user,
      to: testEmail,
      subject: 'CRM SMTP Configuration Test ✅',
      text: 'If you receive this email, your SMTP configuration is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">✅ SMTP Test Successful!</h1>
          </div>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0 0 15px 0; font-size: 16px;">
              Congratulations! Your SMTP configuration is working correctly and your CRM can now send emails.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Sent from your CRM Application<br>
              Test performed at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    });

    console.log('Test email sent successfully:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Test email sent successfully! Check your inbox.',
      messageId: info.messageId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('SMTP test error:', error);

    let friendlyMessage = 'SMTP test failed';
    
    if (error.code === 'EAUTH') {
      friendlyMessage = 'Authentication failed. Check your username and password.';
    } else if (error.code === 'ECONNECTION') {
      friendlyMessage = 'Connection failed. Check your host and port settings.';
    } else if (error.code === 'ETIMEDOUT') {
      friendlyMessage = 'Connection timed out. Check your network and firewall settings.';
    } else if (error.message.includes('Invalid login')) {
      friendlyMessage = 'Invalid login credentials. For Gmail, make sure you\'re using an app password.';
    }

    return res.status(400).json({
      success: false,
      message: friendlyMessage,
      details: error.message,
      code: error.code
    });
  }
}