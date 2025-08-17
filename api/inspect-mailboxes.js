// api/test-fetch-all-mail.js - Test fetching from All Mail folder
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
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

    // Try different folders
    const foldersToTry = ['INBOX', 'All Mail', '[Gmail]/All Mail', 'Sent Mail'];
    const results = {};

    for (const folder of foldersToTry) {
      try {
        console.log(`Trying folder: ${folder}`);
        const mailbox = await client.getMailboxLock(folder);
        
        const folderInfo = {
          exists: mailbox.exists || 0,
          recent: mailbox.recent || 0,
          unseen: mailbox.unseen || 0
        };

        // If folder has emails, try to fetch a few
        if (folderInfo.exists > 0) {
          const messages = client.fetch('1:3', {
            envelope: true,
            flags: true,
            internalDate: true
          });

          const emails = [];
          for await (let message of messages) {
            emails.push({
              uid: message.uid,
              subject: message.envelope?.subject || '(No Subject)',
              from: message.envelope?.from?.[0]?.address || 'Unknown',
              fromName: message.envelope?.from?.[0]?.name || '',
              to: message.envelope?.to?.[0]?.address || '',
              date: message.internalDate,
              isRead: message.flags.has('\\Seen'),
              isStarred: message.flags.has('\\Flagged')
            });
          }
          folderInfo.sampleEmails = emails;
        }

        mailbox.release();
        results[folder] = folderInfo;

      } catch (folderError) {
        results[folder] = { error: folderError.message };
      }
    }

    await client.logout();

    return res.status(200).json({
      success: true,
      message: 'Folder scan complete',
      results,
      recommendation: Object.keys(results).find(folder => 
        results[folder].exists > 0
      ) || 'INBOX',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Folder scan failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to scan folders',
      error: error.message
    });
  }
}