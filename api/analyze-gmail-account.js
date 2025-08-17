// api/analyze-gmail-account.js - Complete Gmail account analysis
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  try {
    const { ImapFlow } = await import('imapflow');

    const config = {
      host: process.env.IMAP_HOST,
      port: parseInt(process.env.IMAP_PORT),
      secure: process.env.IMAP_SECURE === 'true',
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASSWORD
      }
    };

    const client = new ImapFlow(config);
    await client.connect();

    // Get ALL mailboxes
    const allMailboxes = await client.list();
    console.log('All mailboxes found:', allMailboxes.map(m => m.name));

    const analysis = {
      totalMailboxes: allMailboxes.length,
      mailboxes: [],
      totalEmails: 0,
      hasEmails: false,
      recommendations: []
    };

    // Check each mailbox
    for (const mailbox of allMailboxes) {
      try {
        console.log(`Analyzing mailbox: ${mailbox.name}`);
        
        const lock = await client.getMailboxLock(mailbox.name);
        const mailboxInfo = {
          name: mailbox.name,
          path: mailbox.path,
          exists: lock.exists || 0,
          recent: lock.recent || 0,
          unseen: lock.unseen || 0,
          flags: mailbox.flags || [],
          delimiter: mailbox.delimiter,
          hasChildren: mailbox.hasChildren,
          specialUse: mailbox.specialUse
        };

        analysis.totalEmails += mailboxInfo.exists;
        if (mailboxInfo.exists > 0) {
          analysis.hasEmails = true;
        }

        // If mailbox has emails, get some samples
        if (mailboxInfo.exists > 0) {
          try {
            // Try to get last 3 emails
            const sequence = mailboxInfo.exists > 3 ? `${mailboxInfo.exists-2}:${mailboxInfo.exists}` : '1:*';
            
            const messages = client.fetch(sequence, {
              envelope: true,
              flags: true,
              internalDate: true
            });

            const samples = [];
            for await (let message of messages) {
              samples.push({
                seq: message.seq,
                uid: message.uid,
                subject: message.envelope?.subject || '(No Subject)',
                from: message.envelope?.from?.[0]?.address || 'Unknown',
                fromName: message.envelope?.from?.[0]?.name || '',
                date: message.internalDate?.toISOString(),
                isRead: message.flags.has('\\Seen'),
                isStarred: message.flags.has('\\Flagged'),
                size: message.size
              });
            }
            mailboxInfo.recentEmails = samples;
          } catch (sampleError) {
            mailboxInfo.sampleError = sampleError.message;
          }
        }

        lock.release();
        analysis.mailboxes.push(mailboxInfo);

      } catch (mailboxError) {
        analysis.mailboxes.push({
          name: mailbox.name,
          error: mailboxError.message,
          exists: 0
        });
      }
    }

    await client.logout();

    // Generate recommendations
    if (!analysis.hasEmails) {
      analysis.recommendations.push("No emails found in any mailbox");
      analysis.recommendations.push("This Gmail account appears to be empty or newly created");
      analysis.recommendations.push("Try sending a test email to this account first");
      analysis.recommendations.push("Check if emails are being filtered or forwarded elsewhere");
    } else {
      const bestMailbox = analysis.mailboxes
        .filter(m => m.exists > 0)
        .sort((a, b) => b.exists - a.exists)[0];
      
      if (bestMailbox) {
        analysis.recommendations.push(`Use "${bestMailbox.name}" folder - it has ${bestMailbox.exists} emails`);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Gmail account analysis complete',
      account: process.env.IMAP_USER,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gmail analysis failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze Gmail account',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}