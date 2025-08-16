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

    // Test SMTP connection and send email
    const result = await sendSMTPEmail({
      host: config.host,
      port: parseInt(config.port) || 587,
      secure: config.secure === true || config.secure === 'true',
      user: config.user,
      password: config.password,
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

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              Sent from your CRM Application<br>
              Test performed at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
      `
    });

    if (result.success) {
      console.log('Test email sent successfully');
      return res.status(200).json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(400).json(result);
    }

  } catch (error) {
    console.error('SMTP test error:', error);

    return res.status(500).json({
      success: false,
      message: 'SMTP test failed',
      details: error.message
    });
  }
}

// Native SMTP implementation
async function sendSMTPEmail(config) {
  return new Promise((resolve) => {
    let socket;
    let dataBuffer = '';
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

    const emailData = [
      `Message-ID: <${messageId}>`,
      `From: ${config.from}`,
      `To: ${config.to}`,
      `Subject: ${config.subject}`,
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="boundary123"',
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
            resolve({ success: false, message: 'AUTH LOGIN failed', details: response });
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
            resolve({ success: false, message: 'Password authentication failed. Check your credentials.', details: response });
          }
        } else if (step === 7) { // MAIL FROM
          if (code === 250) {
            socket.write(commands[7] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'MAIL FROM failed', details: response });
          }
        } else if (step === 8) { // RCPT TO
          if (code === 250) {
            socket.write(commands[8] + '\r\n');
            step++;
          } else {
            resolve({ success: false, message: 'RCPT TO failed', details: response });
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
      resolve({ 
        success: false, 
        message: 'Connection error', 
        details: error.message 
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

    socket.on('close', () => {
      console.log('SMTP connection closed');
    });
  });
}