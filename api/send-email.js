import nodemailer from 'nodemailer';

// Configure CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Create transporter function with enhanced error handling
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
    },
    // Add timeout settings
    connectionTimeout: 60000, // 60 seconds
    socketTimeout: 60000, // 60 seconds
    // Add retry logic
    retryDelay: 1000,
    maxRetries: 3
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

    // Enhanced validation
    if (!to || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: to, subject, body'
      });
    }

    // Validate email formats
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient email format'
      });
    }

    if (cc && cc.trim() && !emailRegex.test(cc.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid CC email format'
      });
    }

    if (bcc && bcc.trim() && !emailRegex.test(bcc.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid BCC email format'
      });
    }

    // Create transporter
    const transporter = createTransporter();

    // Verify connection before sending
    try {
      await transporter.verify();
      console.log('SMTP connection verified');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        message: 'SMTP connection failed. Please check your configuration.',
        details: verifyError.message
      });
    }

    // Prepare email options
    const mailOptions = {
      from: from || process.env.SMTP_USER,
      to: to,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
      priority: priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'normal'
    };

    // Add CC and BCC if provided and valid
    if (cc && cc.trim()) mailOptions.cc = cc.trim();
    if (bcc && bcc.trim()) mailOptions.bcc = bcc.trim();

    // Send email with retry logic
    console.log('Sending email to:', to);
    let emailSent = false;
    let retries = 0;
    const maxRetries = 3;
    let lastError;

    while (!emailSent && retries < maxRetries) {
      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        
        return res.status(200).json({
          success: true,
          message: 'Email sent successfully',
          messageId: info.messageId,
          timestamp: new Date().toISOString(),
          customerId,
          customerName,
          attempts: retries + 1
        });
        
      } catch (sendError) {
        lastError = sendError;
        retries++;
        console.error(`Email send attempt ${retries} failed:`, sendError.message);
        
        if (retries >= maxRetries) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
      }
    }

    // If we get here, all retries failed
    throw lastError;

  } catch (error) {
    console.error('Email send error:', error);
    
    // Provide specific error messages for common issues
    let friendlyMessage = error.message;
    let errorCode = error.code;
    
    if (error.message.includes('SMTP configuration incomplete')) {
      friendlyMessage = 'SMTP not configured. Please set up environment variables in Vercel.';
    } else if (error.code === 'EAUTH' || error.responseCode === 535) {
      friendlyMessage = 'Authentication failed. Check your email and password. For Gmail, use an app password.';
    } else if (error.code === 'ECONNECTION' || error.code === 'ENOTFOUND') {
      friendlyMessage = 'Connection failed. Check your SMTP host and port settings.';
    } else if (error.code === 'ETIMEDOUT') {
      friendlyMessage = 'Connection timed out. Please try again or check your network.';
    } else if (error.responseCode === 550) {
      friendlyMessage = 'Email rejected by server. Check recipient email address.';
    } else if (error.responseCode === 554) {
      friendlyMessage = 'Email rejected as spam. Try different content or sender.';
    } else if (error.code === 'EMESSAGE') {
      friendlyMessage = 'Invalid email content. Check your message format.';
    }
    
    return res.status(500).json({
      success: false,
      message: friendlyMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: errorCode,
      responseCode: error.responseCode
    });
  }
}