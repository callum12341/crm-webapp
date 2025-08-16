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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return res.status(400).json({
        success: false,
        message: 'SMTP not configured'
      });
    }

    const { emails } = req.body;
    
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emails array'
      });
    }

    const transporter = createTransporter();
    const results = [];

    // Process emails with delay to avoid rate limiting
    for (const emailData of emails) {
      try {
        const mailOptions = {
          from: emailData.from || process.env.SMTP_USER,
          to: emailData.to,
          cc: emailData.cc,
          bcc: emailData.bcc,
          subject: emailData.subject,
          text: emailData.body,
          html: emailData.body.replace(/\n/g, '<br>')
        };

        const info = await transporter.sendMail(mailOptions);
        results.push({
          success: true,
          messageId: info.messageId,
          to: emailData.to,
          customerId: emailData.customerId
        });

        // Add small delay between emails
        if (emails.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }

      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          to: emailData.to,
          customerId: emailData.customerId
        });
      }
    }

    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(200).json({
      success: true,
      results: results,
      total: emails.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    });

  } catch (error) {
    console.error('Bulk email error:', error);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
}