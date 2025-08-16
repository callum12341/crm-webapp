// Use require instead of import for nodemailer in Vercel
const nodemailer = require('nodemailer');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function handler(req, res) {
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

    // Create test transporter with provided config
    const testTransporter = nodemailer.createTransporter({
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

          <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #374151; margin: 0 0 15px 0;">📧 Configuration Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Host:</td>
                <td style="padding: 8px 0; color: #374151;">${config.host}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Port:</td>
                <td style="padding: 8px 0; color: #374151;">${config.port}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">Secure:</td>
                <td style="padding: 8px 0; color: #374151;">${config.secure ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: bold;">User:</td>
                <td style="padding: 8px 0; color: #374151;">${config.user}</td>
              </tr>
            </table>
          </div>

          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin: 0 0 10px 0;">🚀 What's Next?</h3>
            <ul style="margin: 0; padding-left: 20px; color: #374151;">
              <li>Your CRM is ready to send emails to customers</li>
              <li>Use email templates for consistent messaging</li>
              <li>Queue emails for batch sending</li>
              <li>Track email delivery and responses</li>
            </ul>
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

module.exports = handler;