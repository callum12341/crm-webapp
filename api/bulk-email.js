import nodemailer from 'nodemailer';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

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
    // Add connection pooling for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 10,
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
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'SMTP not configured. Please set environment variables in Vercel dashboard.',
        setupInstructions: {
          step1: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          step2: 'Add SMTP_HOST (e.g., smtp.gmail.com)',
          step3: 'Add SMTP_USER (your email)',
          step4: 'Add SMTP_PASSWORD (your app password)',
          step5: 'Redeploy your application'
        }
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

    // Limit bulk email size to prevent timeouts
    if (emails.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Too many emails. Maximum 50 emails per batch.'
      });
    }

    console.log(`Processing bulk email request for ${emails.length} emails`);

    const transporter = createTransporter();
    
    // Verify transporter connection before starting
    try {
      await transporter.verify();
      console.log('SMTP connection verified for bulk send');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return res.status(500).json({
        success: false,
        message: 'SMTP connection failed. Please check your configuration.',
        error: verifyError.message
      });
    }

    const results = [];
    let successful = 0;
    let failed = 0;

    // Process emails with improved error handling
    for (let i = 0; i < emails.length; i++) {
      const emailData = emails[i];
      
      try {
        // Validate email data
        if (!emailData.to || !emailData.subject || !emailData.body) {
          throw new Error('Missing required fields: to, subject, body');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailData.to)) {
          throw new Error('Invalid email format');
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

        // Add CC and BCC if provided and valid
        if (emailData.cc && emailData.cc.trim()) {
          if (emailRegex.test(emailData.cc.trim())) {
            mailOptions.cc = emailData.cc.trim();
          }
        }
        if (emailData.bcc && emailData.bcc.trim()) {
          if (emailRegex.test(emailData.bcc.trim())) {
            mailOptions.bcc = emailData.bcc.trim();
          }
        }

        console.log(`Sending email ${i + 1}/${emails.length} to: ${emailData.to}`);
        
        // Add retry logic for individual emails
        let emailSent = false;
        let retries = 0;
        const maxRetries = 3;
        
        while (!emailSent && retries < maxRetries) {
          try {
            const info = await transporter.sendMail(mailOptions);
            
            results.push({
              success: true,
              messageId: info.messageId,
              to: emailData.to,
              customerId: emailData.customerId,
              customerName: emailData.customerName,
              timestamp: new Date().toISOString(),
              attempts: retries + 1
            });
            
            successful++;
            emailSent = true;
            console.log(`Email ${i + 1} sent successfully: ${info.messageId}`);
            
          } catch (sendError) {
            retries++;
            console.error(`Email ${i + 1} attempt ${retries} failed:`, sendError.message);
            
            if (retries >= maxRetries) {
              throw sendError;
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          }
        }

        // Add delay between emails to avoid rate limiting
        // Skip delay for the last email
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }

      } catch (error) {
        console.error(`Email ${i + 1} failed permanently:`, error.message);
        
        results.push({
          success: false,
          error: error.message,
          to: emailData.to,
          customerId: emailData.customerId,
          customerName: emailData.customerName,
          timestamp: new Date().toISOString(),
          errorCode: error.code
        });
        
        failed++;
      }
    }

    // Close the transporter
    transporter.close();

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
      timestamp: new Date().toISOString(),
      processingTime: `${((Date.now() - Date.now()) / 1000).toFixed(2)}s`
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