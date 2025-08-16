import nodemailer from 'nodemailer';

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Create transporter function with error handling
const createTransporter = () => {
  // Check if required environment variables exist
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  
  if (!host || !user || !pass) {
    throw new Error('SMTP configuration incomplete. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables.');
  }

  return nodemailer.createTransporter({
    host: host,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: user,
      pass: pass
    }
  });
};

// Main handler function
async function handler(req, res) {
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
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'SMTP not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables in Vercel dashboard.',
        setupInstructions: {
          step1: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          step2: 'Add SMTP_HOST (e.g., smtp.gmail.com)',
          step3: 'Add SMTP_USER (your email)',
          step4: 'Add SMTP_PASSWORD (your app password)',
          step5: 'Redeploy your application'
        }
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
    
    // Provide specific error messages for common issues
    let friendlyMessage = error.message;
    
    if (error.message.includes('SMTP configuration incomplete')) {
      friendlyMessage = 'SMTP not configured. Please set up environment variables in Vercel.';
    } else if (error.code === 'EAUTH') {
      friendlyMessage = 'Authentication failed. Check your email and password.';
    } else if (error.code === 'ECONNECTION') {
      friendlyMessage = 'Connection failed. Check your SMTP host and port.';
    }
    
    return res.status(500).json({
      success: false,
      message: friendlyMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code
    });
  }
}

// THIS IS THE CRITICAL PART - Export the handler as default
export default handler;