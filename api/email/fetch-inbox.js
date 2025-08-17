// api/email/fetch-inbox.js - Optimized for large mailboxes (15k+ emails)
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
    console.log('🗂️ Starting IMAP fetch for large mailbox...');

    // Enhanced config logging
    console.log('IMAP Config check:', {
      host: process.env.IMAP_HOST,
      port: process.env.IMAP_PORT,
      secure: process.env.IMAP_SECURE,
      user: process.env.IMAP_USER ? 'SET' : 'MISSING',
      password: process.env.IMAP_PASSWORD ? 'SET' : 'MISSING'
    });

    const imapConfig = {
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT) || 993,
      secure: process.env.IMAP_SECURE !== 'false',
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD
      }
    };

    if (!imapConfig.host || !imapConfig.auth.user || !imapConfig.auth.pass) {
      return res.status(400).json({
        success: false,
        message: 'IMAP not configured. Please set IMAP environment variables.'
      });
    }

    // Import ImapFlow
    let ImapFlow;
    try {
      const imapModule = await import('imapflow');
      ImapFlow = imapModule.ImapFlow;
      console.log('✅ ImapFlow imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import ImapFlow:', importError);
      return res.status(500).json({
        success: false,
        message: 'IMAP library not available.',
        error: importError.message
      });
    }

    // Get request parameters with safe defaults for large mailboxes
    const { 
      folderName = 'INBOX', 
      limit = 10,  // MUCH smaller default
      since,
      searchCriteria 
    } = req.body;

    // Enforce limits for large mailboxes
    const safeLimit = Math.min(parseInt(limit), 50); // Never more than 50
    
    console.log(`📊 Fetch parameters:`, {
      folder: folderName,
      limit: safeLimit,
      since: since ? 'YES' : 'NO',
      searchCriteria: searchCriteria || 'ALL'
    });

    console.log('🔌 Connecting to IMAP server...');
    const client = new ImapFlow(imapConfig);

    try {
      await client.connect();
      console.log('✅ IMAP connection successful');
      
      const lock = await client.getMailboxLock(folderName);
      console.log(`📧 Mailbox "${folderName}" info:`, {
        exists: lock.exists,
        recent: lock.recent,
        unseen: lock.unseen
      });
      
      // For large mailboxes, always return info even if we don't fetch all
      if (lock.exists === 0) {
        lock.release();
        return res.status(200).json({
          success: true,
          message: 'Mailbox is empty',
          emails: [],
          stats: { 
            totalProcessed: 0, 
            mailboxInfo: { exists: 0 }
          }
        });
      }

      try {
        // Build optimized search criteria for large mailboxes
        let searchQuery;
        
        if (searchCriteria === 'UNSEEN') {
          searchQuery = ['UNSEEN'];
        } else if (since) {
          const sinceDate = new Date(since);
          searchQuery = ['SINCE', sinceDate];
          console.log(`🔍 Searching emails since: ${sinceDate.toISOString()}`);
        } else {
          // For large mailboxes, we'll fetch the most recent emails
          // by using a sequence range instead of searching all
          searchQuery = null; // We'll use sequence instead
        }

        const emailsProcessed = [];
        const errors = [];
        let processedCount = 0;

        console.log(`🔄 Processing up to ${safeLimit} emails...`);

        let messages;
        
        if (searchQuery) {
          // Use search criteria
          console.log('🔍 Using search criteria:', searchQuery);
          messages = client.fetch(searchQuery, {
            uid: true,
            flags: true,
            envelope: true,
            bodyStructure: true,
            size: true,
            internalDate: true
          }, { uid: true });
        } else {
          // For large mailboxes: fetch most recent emails using sequence
          const startSeq = Math.max(1, lock.exists - safeLimit + 1);
          const endSeq = lock.exists;
          const sequence = `${startSeq}:${endSeq}`;
          
          console.log(`📨 Fetching recent emails using sequence: ${sequence} (${startSeq} to ${endSeq} of ${lock.exists})`);
          
          messages = client.fetch(sequence, {
            uid: true,
            flags: true,
            envelope: true,
            bodyStructure: true,
            size: true,
            internalDate: true
          });
        }

        for await (let message of messages) {
          if (processedCount >= safeLimit) {
            console.log(`⏹️ Reached limit of ${safeLimit} emails`);
            break;
          }
          
          try {
            console.log(`📩 Processing email ${processedCount + 1}/${safeLimit}: UID ${message.uid}`);

            // For large mailboxes, limit body fetching to avoid timeouts
            let bodyText = '';
            try {
              // Only fetch first part and limit size
              const bodyParts = await client.download(message.uid, '1', { uid: true, maxBytes: 5000 });
              if (bodyParts) {
                bodyText = bodyParts.toString('utf8').substring(0, 2000);
              }
            } catch (bodyError) {
              console.warn(`⚠️ Could not fetch body for UID ${message.uid}:`, bodyError.message);
              bodyText = `[Body fetch failed: ${bodyError.message}]`;
            }

            const emailData = {
              uid: message.uid,
              subject: message.envelope.subject || '(No Subject)',
              from: message.envelope.from?.[0]?.address || '',
              fromName: message.envelope.from?.[0]?.name || '',
              to: message.envelope.to?.[0]?.address || '',
              cc: message.envelope.cc?.map(addr => addr.address).join(', ') || '',
              bcc: message.envelope.bcc?.map(addr => addr.address).join(', ') || '',
              body: bodyText,
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
            console.error(`❌ Error processing email UID ${message.uid}:`, emailError.message);
            errors.push({
              uid: message.uid,
              error: emailError.message
            });
          }
        }

        console.log(`✅ Successfully processed ${emailsProcessed.length} emails from large mailbox`);

        return res.status(200).json({
          success: true,
          message: `Fetched ${emailsProcessed.length} emails from ${folderName} (${lock.exists} total)`,
          emails: emailsProcessed,
          errors,
          stats: {
            totalProcessed: emailsProcessed.length,
            errorsCount: errors.length,
            folder: folderName,
            limit: safeLimit,
            mailboxInfo: {
              exists: lock.exists,
              recent: lock.recent,
              unseen: lock.unseen
            },
            largeMailbox: lock.exists > 1000,
            fetchStrategy: searchQuery ? 'search' : 'sequence'
          },
          timestamp: new Date().toISOString()
        });

      } finally {
        lock.release();
      }

    } catch (error) {
      console.error('❌ Detailed IMAP error:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      return res.status(500).json({
        success: false,
        message: `IMAP Error: ${error.message}`,
        errorCode: error.code,
        suggestions: getErrorSuggestions(error)
      });
    } finally {
      try {
        await client.logout();
        console.log('✅ Disconnected from IMAP server');
      } catch (logoutError) {
        console.warn('⚠️ Error during logout:', logoutError.message);
      }
    }

  } catch (error) {
    console.error('❌ IMAP fetch error:', error);
    
    return res.status(500).json({
      success: false,
      message: `Failed to fetch emails: ${error.message}`,
      details: error.message,
      code: error.code,
      suggestions: [
        'Try reducing the limit to 5-10 emails',
        'Use time-based filtering (since parameter)',
        'Check if the mailbox is too large for IMAP operations'
      ]
    });
  }
}

function getErrorSuggestions(error) {
  const suggestions = [];
  
  if (error.code === 'ECONNREFUSED') {
    suggestions.push('Check IMAP host and port settings');
    suggestions.push('Verify firewall allows outbound IMAP connections');
  } else if (error.message.includes('authentication')) {
    suggestions.push('Verify IMAP username and password');
    suggestions.push('Use app-specific password if 2FA is enabled');
  } else if (error.message.includes('timeout')) {
    suggestions.push('Mailbox is too large - try smaller limits (5-10 emails)');
    suggestions.push('Use time-based filtering to reduce search scope');
    suggestions.push('Try fetching from smaller folders first');
  } else if (error.message.includes('SELECT') || error.message.includes('EXAMINE')) {
    suggestions.push('Try different folder name (INBOX, Sent, etc.)');
    suggestions.push('Check if the mailbox exists and has read permissions');
  }
  
  return suggestions;
}