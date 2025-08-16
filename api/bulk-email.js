import nodemailer from 'nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
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
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return res.status(400).json({
        success: false,
        message: 'SMTP not configured. Please set environment variables in Vercel dashboard.'
      });
    }

    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emails array. Expected array of email objects.'
      });
    }

    if (emails.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No emails to send'
      });
    }

    console.log(`Processing bulk email request for ${emails.length} emails`);

    const transporter = createTransporter();
    const results = [];
    let successful = 0;
    let failed = 0;

    // Process emails with delay to avoid rate limiting
    for (let i = 0; i < emails.length; i++) {
      const emailData = emails[i];
      
      try {
        // Validate email data
        if (!emailData.to || !emailData.subject || !emailData.body) {
          throw new Error('Missing required fields: to, subject, body');
        }

        const mailOptions = {
          from: emailData.from || process.env.SMTP_USER,
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.body,
          html: emailData.body.replace(/\n/g, '<br>'),
          priority: emailData.priority === 'high' ? 'high' : 
                   emailData.priority === 'low' ? 'low' : 'normal'
        };

        // Add CC and BCC if provided
        if (emailData.cc && emailData.cc.trim()) mailOptions.cc = emailData.cc;
        if (emailData.bcc && emailData.bcc.trim()) mailOptions.bcc = emailData.bcc;

        console.log(`Sending email ${i + 1}/${emails.length} to: ${emailData.to}`);
        const info = await transporter.sendMail(mailOptions);
        
        results.push({
          success: true,
          messageId: info.messageId,
          to: emailData.to,
          customerId: emailData.customerId,
          customerName: emailData.customerName,
          timestamp: new Date().toISOString()
        });
        
        successful++;
        console.log(`Email ${i + 1} sent successfully: ${info.messageId}`);

        // Add delay between emails to avoid rate limiting
        // Skip delay for the last email
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }

      } catch (error) {
        console.error(`Email ${i + 1} failed:`, error.message);
        
        results.push({
          success: false,
          error: error.message,
          to: emailData.to,
          customerId: emailData.customerId,
          customerName: emailData.customerName,
          timestamp: new Date().toISOString()
        });
        
        failed++;
      }
    }

    console.log(`Bulk email completed: ${successful} successful, ${failed} failed`);

    return res.status(200).json({
      success: true,
      message: `Bulk email completed: ${successful} sent, ${failed} failed`,
      results: results,
      summary: {
        total: emails.length,
        successful: successful,
        failed: failed,
        successRate: Math.round((successful / emails.length) * 100)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Bulk email error:', error);

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process bulk emails',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export default handler;