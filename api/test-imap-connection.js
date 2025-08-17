// api/test-imap-connection.js - Simple IMAP connection test
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    console.log('Starting IMAP connection test...');

    // Import ImapFlow
    const { ImapFlow } = await import('imapflow');

    // IMAP configuration
    const config = {
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT),
      secure: process.env.IMAP_SECURE === 'true',
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD
      }
    };

    console.log('Connecting with config:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user
    });

    const client = new ImapFlow(config);

    // Test connection
    await client.connect();
    console.log('✅ Connected successfully!');

    // Get mailbox info
    const mailbox = await client.getMailboxLock('INBOX');
    const mailboxInfo = {
      exists: mailbox.exists,
      recent: mailbox.recent,
      unseen: mailbox.unseen
    };
    mailbox.release();

    // List some mailboxes
    const mailboxes = await client.list();
    const mailboxNames = mailboxes.slice(0, 10).map(box => box.name);

    await client.logout();
    console.log('✅ Disconnected successfully!');

    return res.status(200).json({
      success: true,
      message: 'IMAP connection successful!',
      mailboxInfo,
      availableMailboxes: mailboxNames,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        user: config.auth.user
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('IMAP connection failed:', error);

    let errorInfo = {
      success: false,
      message: 'IMAP connection failed',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    };

    // Specific error handling
    if (error.code === 'ECONNREFUSED') {
      errorInfo.suggestion = 'Check IMAP host and port settings';
    } else if (error.message.includes('Invalid credentials')) {
      errorInfo.suggestion = 'Check your email and app password. For Gmail, make sure you use an App Password, not your regular password.';
    } else if (error.message.includes('TLS') || error.message.includes('SSL')) {
      errorInfo.suggestion = 'Try different secure/port combinations';
    }

    return res.status(400).json(errorInfo);
  }
}