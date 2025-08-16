import { connect } from 'tls';
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
    // Check if SMTP is configured via environment variables
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return res.status(400).json({
        success: false,
        message: 'SMTP not configured. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables in Vercel dashboard.',
        setupInstructions: {
          step1: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          step2: 'Add SMTP_HOST (e.g., smtp.gmail.com)',
          step3: 'Add SMTP_USER (your email)',
          step4: 'Add SMTP_PASSWORD (your app password)',
          step5: 'Add SMTP_PORT (587) - optional',
          step6: 'Redeploy your application'
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient email format'
      });
    }

    // Send email using native SMTP
    console.log('Sending email to:', to);
    
    const result = await sendSMTPEmail({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      from: from || process.env.SMTP_USER,
      to: to,
      cc: cc,
      bcc: bcc,
      subject: subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
      priority: priority
    });

    if (result.success) {
      console.log('Email sent successfully:', result.messageId);
      
      return res.status(200).json({
        success: true,
        message: 'Email sent successfully',
        messageId: result.messageId,
        timestamp: new Date().toISOString(),
        customerId,
        customerName
      });
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('Email send error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to send email',
      details: error.message
    });
  }
}

// Native SMTP implementation for sending emails
async function sendSMTPEmail(config) {
  return new Promise((resolve) => {
    let socket;
    let step = 0;
    const messageId = `msg_${Date.now()}@${config.host}`;
    
    // SMTP commands sequence
    const commands = [
      `EHLO ${config.host}`,
      'STARTTLS',
      `EHLO ${config.host}`,
      'AUTH LOGIN',
      Buffer.from(config.user).toString('base64'),
      Buffer.from(config.password).toString('base64'),
      `MAIL FROM:<${config.from}>`,
      `RCPT TO:<${config.to}>`,
      'DATA'
    ];

    // Add CC and BCC recipients
    const recipients = [config.to];
    if (config.cc && config.cc.trim()) recipients.push(config.cc.trim());
    if (config.bcc && config.bcc.trim()) recipients.push(config.bcc.trim());

    // Build email headers
    const headers = [
      `Message-ID: <${messageId}>`,
      `From: ${config.from}`,
      `To: ${config.to}`,
      `Subject: ${config.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"'
    ];

    if (config.cc && config.cc.trim()) headers.push(`Cc: ${config.cc.trim()}`);
    if (config.priority === 'high') headers.push('X-Priority: 1');
    if (config.priority === 'low') headers.push('X-Priority: 5');

    const emailData = [
      ...headers,
      '',
      '--boundary123',
      'Content-Type: text/plain; charset=UTF-8',
      '',
      config.text,
      '',
      '--boundary123',
      'Content-Type: text/html; charset=UTF-8',
      '',
      config.html,
      '',
      '--boundary123--',
      '',
      '.'
    ].join('\r\n');

    let currentRecipient = 0;

    function handleResponse(data) {
      const response = data.toString().trim();
      console.log('SMTP Response:', response);
      
      const code = parseInt(response.substring(0, 3));
      
      try {
        if (step === 0) { // Initial connection
          if (code === 220) {
            socket.write(commands[0] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'SMTP connection failed', details: response });
          }
        } else if (step === 1) { // EHLO response
          if (code === 250) {
            socket.write(commands[1] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'EHLO failed', details: response });
          }
        } else if (step === 2) { // STARTTLS response
          if (code === 220) {
            // Upgrade to TLS
            const tlsSocket = connect({
              socket: socket,
              servername: config.host
            });
            
            tlsSocket.on('secureConnect', () => {
              socket = tlsSocket;
              socket.write(commands[2] + '\r\n');
              step++;
            });
            
            tlsSocket.on('data', handleResponse);
            tlsSocket.on('error', (error) => {
              resolve({ success: false, message: 'TLS connection failed', details: error.message });
            });
          } else {
            resolve({ success: false, message: 'STARTTLS failed', details: response });
          }
        } else if (step === 3) { // EHLO after TLS
          if (code === 250) {
            socket.write(commands[3] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'EHLO after TLS failed', details: response });
          }
        } else if (step === 4) { // AUTH LOGIN
          if (code === 334) {
            socket.write(commands[4] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'Authentication not supported', details: response });
          }
        } else if (step === 5) { // Username
          if (code === 334) {
            socket.write(commands[5] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'Username authentication failed', details: response });
          }
        } else if (step === 6) { // Password
          if (code === 235) {
            socket.write(commands[6] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'Authentication failed. Check your email and password.', details: response });
          }
        } else if (step === 7) { // MAIL FROM
          if (code === 250) {
            // Send RCPT TO for first recipient
            socket.write(`RCPT TO:<${recipients[currentRecipient]}>\r\n`);
            step++;
          } else {
            resolve({ success: false, message: 'MAIL FROM failed', details: response });
          }
        } else if (step === 8) { // RCPT TO
          if (code === 250) {
            currentRecipient++;
            if (currentRecipient < recipients.length) {
              // Send RCPT TO for next recipient
              socket.write(`RCPT TO:<${recipients[currentRecipient]}>\r\n`);
            } else {
              // All recipients added, proceed to DATA
              socket.write(commands[8] + '\r\n');
              step++;
            }
          } else {
            resolve({ success: false, message: `Recipient ${recipients[currentRecipient]} rejected`, details: response });
          }
        } else if (step === 9) { // DATA command
          if (code === 354) {
            socket.write(emailData + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'DATA command failed', details: response });
          }
        } else if (step === 10) { // Email sent
          if (code === 250) {
            socket.write('QUIT\r\n');
            socket.destroy();
            resolve({ 
              success: true, 
              message: 'Email sent successfully',
              messageId: messageId
            });
          } else {
            resolve({ success: false, message: 'Email sending failed', details: response });
          }
        }
      } catch (error) {
        resolve({ success: false, message: 'SMTP protocol error', details: error.message });
      }
    }

    // Create initial connection
    socket = createConnection({
      host: config.host,
      port: config.port,
      timeout: 30000
    });

    socket.on('connect', () => {
      console.log('Connected to SMTP server');
    });

    socket.on('data', handleResponse);

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      let friendlyMessage = 'Connection error';
      
      if (error.code === 'ECONNREFUSED') {
        friendlyMessage = 'Connection refused. Check your SMTP host and port.';
      } else if (error.code === 'ENOTFOUND') {
        friendlyMessage = 'SMTP server not found. Check your host setting.';
      } else if (error.code === 'ETIMEDOUT') {
        friendlyMessage = 'Connection timed out. Check your network settings.';
      }
      
      resolve({ 
        success: false, 
        message: friendlyMessage, 
        details: error.message,
        code: error.code
      });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ 
        success: false, 
        message: 'Connection timeout',
        details: 'SMTP server did not respond within 30 seconds'
      });
    });
  });
}