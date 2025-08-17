// api/email/fetch-inbox.js - Fixed IMAP email fetching service
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
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
    console.log('Starting IMAP fetch process...');

    // Check IMAP configuration
    const imapConfig = {
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT) || 993,
      secure: process.env.IMAP_SECURE !== 'false',
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD
      }
    };

    console.log('IMAP Config:', {
      host: imapConfig.host,
      port: imapConfig.port,
      secure: imapConfig.secure,
      user: imapConfig.auth.user,
      hasPassword: !!imapConfig.auth.pass
    });

    if (!imapConfig.host || !imapConfig.auth.user || !imapConfig.auth.pass) {
      return res.status(400).json({
        success: false,
        message: 'IMAP not configured. Please set IMAP environment variables.',
        missingVars: {
          IMAP_HOST: !imapConfig.host,
          IMAP_USER: !imapConfig.auth.user,
          IMAP_PASSWORD: !imapConfig.auth.pass
        },
        setupInstructions: {
          step1: 'Go to Vercel Dashboard → Your Project → Settings → Environment Variables',
          step2: 'Add IMAP_HOST (e.g., imap.gmail.com)',
          step3: 'Add IMAP_USER (your email)',
          step4: 'Add IMAP_PASSWORD (your app password)',
          step5: 'Add IMAP_PORT (993) - optional',
          step6: 'Add IMAP_SECURE (true) - optional',
          step7: 'Redeploy your application'
        }
      });
    }

    // Try to import ImapFlow
    let ImapFlow;
    try {
      const imapModule = await import('imapflow');
      ImapFlow = imapModule.ImapFlow;
      console.log('ImapFlow imported successfully');
    } catch (importError) {
      console.error('Failed to import ImapFlow:', importError);
      return res.status(500).json({
        success: false,
        message: 'IMAP library not available. Please install imapflow package.',
        error: importError.message,
        solution: 'Run: npm install imapflow'
      });
    }

    const { folderName = 'INBOX', limit = 50, since } = req.body;

    console.log('Connecting to IMAP server...');
    const client = new ImapFlow(imapConfig);

    try {
      await client.connect();
      console.log('Connected to IMAP server successfully');

      console.log('Selecting mailbox:', folderName);
      const mailbox = await client.getMailboxLock(folderName);

      try {
        // Build search criteria
        let searchCriteria = ['ALL'];
        if (since) {
          const sinceDate = new Date(since);
          searchCriteria = ['SINCE', sinceDate];
        }

        console.log('Searching for messages with criteria:', searchCriteria);

        // Fetch message UIDs
        const messages = client.fetch(searchCriteria, {
          uid: true,
          flags: true,
          envelope: true,
          bodyStructure: true,
          size: true,
          internalDate: true
        }, { uid: true });

        const emailsProcessed = [];
        const errors = [];
        let processedCount = 0;

        console.log('Processing messages...');
        for await (let message of messages) {
          if (processedCount >= limit) break;
          
          try {
            console.log(`Processing message ${processedCount + 1}/${limit}`);

            // Get message body
            let bodyText = '';
            try {
              const bodyParts = await client.download(message.uid, '1', { uid: true });
              if (bodyParts) {
                bodyText = bodyParts.toString('utf8');
              }
            } catch (bodyError) {
              console.warn('Could not fetch body for message:', bodyError.message);
              bodyText = 'Could not fetch message body';
            }

            // Extract email data
            const emailData = {
              uid: message.uid,
              subject: message.envelope.subject || '(No Subject)',
              from: message.envelope.from?.[0]?.address || '',
              fromName: message.envelope.from?.[0]?.name || '',
              to: message.envelope.to?.[0]?.address || '',
              cc: message.envelope.cc?.map(addr => addr.address).join(', ') || '',
              bcc: message.envelope.bcc?.map(addr => addr.address).join(', ') || '',
              body: bodyText.substring(0, 5000), // Limit body size
              isRead: message.flags.has('\\Seen'),
              isStarred: message.flags.has('\\Flagged'),
              messageId: message.envelope.messageId || null,
              date: message.internalDate,
              size: message.size,
              attachmentCount: message.bodyStructure?.childNodes?.filter(node => 
                node.disposition === 'attachment'
              ).length || 0
            };

            emailsProcessed.push(emailData);
            processedCount++;
            
          } catch (emailError) {
            console.error('Error processing email:', emailError);
            errors.push({
              uid: message.uid,
              error: emailError.message
            });
          }
        }

        console.log(`Successfully processed ${emailsProcessed.length} emails`);

        return res.status(200).json({
          success: true,
          message: `Fetched ${emailsProcessed.length} emails from ${folderName}`,
          emails: emailsProcessed,
          errors,
          stats: {
            totalProcessed: emailsProcessed.length,
            errorsCount: errors.length,
            folder: folderName,
            limit,
            mailboxInfo: {
              exists: mailbox.exists,
              recent: mailbox.recent,
              unseen: mailbox.unseen
            }
          },
          timestamp: new Date().toISOString()
        });

      } finally {
        mailbox.release();
      }

    } finally {
      await client.logout();
      console.log('Disconnected from IMAP server');
    }

  } catch (error) {
    console.error('IMAP fetch error:', error);
    
    // Handle specific IMAP errors
    let friendlyMessage = 'Failed to fetch emails from inbox';
    let suggestions = [];
    
    if (error.code === 'ECONNREFUSED') {
      friendlyMessage = 'Cannot connect to IMAP server';
      suggestions.push('Check IMAP_HOST setting');
      suggestions.push('Verify firewall/network settings');
    } else if (error.code === 'ENOTFOUND') {
      friendlyMessage = 'IMAP server not found';
      suggestions.push('Check IMAP_HOST spelling');
    } else if (error.message.includes('Invalid credentials') || error.message.includes('authentication')) {
      friendlyMessage = 'Authentication failed';
      suggestions.push('Check IMAP_USER and IMAP_PASSWORD');
      suggestions.push('For Gmail: Use App Password, not regular password');
      suggestions.push('Enable 2-Factor Authentication and generate App Password');
    } else if (error.message.includes('TLS') || error.message.includes('SSL')) {
      friendlyMessage = 'Secure connection failed';
      suggestions.push('Check IMAP_SECURE setting');
      suggestions.push('Try IMAP_PORT=993 with IMAP_SECURE=true');
    }

    return res.status(500).json({
      success: false,
      message: friendlyMessage,
      details: error.message,
      code: error.code,
      suggestions,
      debug: {
        errorType: error.constructor.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    });
  }
}