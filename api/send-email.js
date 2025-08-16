import nodemailer from 'nodemailer';

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Create transporter function
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
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return res.status(400).json({
        success: false,
        message: 'SMTP not configured. Please set environment variables in Vercel dashboard.'
      });
    }

    const {
      from,
      to,
      cc,
      bcc,
      subject,
      body,
      priority = 'normal',
      customerId,
      customerName
    } = req.body;

    // Validate required fields
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, body'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Prepare email options
    const mailOptions = {
      from: from || process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
      priority: priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'normal'
    };

    // Add CC and BCC if provided
    if (cc && cc.trim()) mailOptions.cc = cc;
    if (bcc && bcc.trim()) mailOptions.bcc = bcc;

    // Send email
    console.log('Sending email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      messageId: info.messageId,
      timestamp: new Date().toISOString(),
      customerId,
      customerName
    });

  } catch (error) {
    console.error('Email send error:', error);
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send email',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}