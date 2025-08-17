// api/email/fetch-inbox.js - IMAP email fetching service
import { ImapFlow } from 'imapflow';
import { EmailDAO } from '../../lib/database.js';

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

    if (!imapConfig.host || !imapConfig.auth.user || !imapConfig.auth.pass) {
      return res.status(400).json({
        success: false,
        message: 'IMAP not configured. Please set IMAP_HOST, IMAP_USER, and IMAP_PASSWORD environment variables.',
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

    const { folderName = 'INBOX', limit = 50, since } = req.body;

    console.log('Connecting to IMAP server...');
    const client = new ImapFlow(imapConfig);
    await client.connect();

    console.log('Selecting mailbox:', folderName);
    const mailbox = await client.getMailboxLock(folderName);

    try {
      // Build search criteria
      let searchCriteria = ['ALL'];
      if (since) {
        const sinceDate = new Date(since);
        searchCriteria = ['SINCE', sinceDate];
      }

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

      for await (let message of messages) {
        if (processedCount >= limit) break;
        
        try {
          // Get message body
          const bodyParts = await client.download(message.uid, '1', { uid: true });
          let bodyText = '';
          
          if (bodyParts) {
            bodyText = bodyParts.toString('utf8');
          }

          // Extract email data
          const emailData = {
            customer_id: null, // Will be matched later
            customer_name: message.envelope.from?.[0]?.name || 'Unknown',
            subject: message.envelope.subject || '(No Subject)',
            from_email: message.envelope.from?.[0]?.address || '',
            to_email: message.envelope.to?.[0]?.address || '',
            cc_email: message.envelope.cc?.map(addr => addr.address).join(', ') || null,
            bcc_email: message.envelope.bcc?.map(addr => addr.address).join(', ') || null,
            body: bodyText,
            type: 'incoming',
            status: 'received',
            priority: 'normal',
            is_read: message.flags.has('\\Seen'),
            is_starred: message.flags.has('\\Flagged'),
            thread_id: message.envelope.messageId || null,
            smtp_message_id: message.envelope.messageId,
            received_at: message.internalDate.toISOString(),
            attachments: message.bodyStructure?.childNodes?.length > 1 ? 
              message.bodyStructure.childNodes.filter(node => node.disposition === 'attachment') : []
          };

          // Try to match with existing customer
          const matchingCustomer = await findCustomerByEmail(emailData.from_email);
          if (matchingCustomer) {
            emailData.customer_id = matchingCustomer.id;
            emailData.customer_name = matchingCustomer.name;
          }

          // Check for duplicates
          const isDuplicate = await EmailDAO.checkDuplicate(emailData);
          if (isDuplicate) {
            console.log(`Skipping duplicate email: ${emailData.subject}`);
            continue;
          }

          // Save to database
          const savedEmail = await EmailDAO.create(emailData);
          emailsProcessed.push({
            id: savedEmail.id,
            subject: emailData.subject,
            from: emailData.from_email,
            received: emailData.received_at
          });

          processedCount++;
        } catch (emailError) {
          console.error('Error processing email:', emailError);
          errors.push({
            uid: message.uid,
            error: emailError.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Processed ${emailsProcessed.length} new emails`,
        emailsProcessed,
        errors,
        stats: {
          totalProcessed: emailsProcessed.length,
          errorsCount: errors.length,
          folder: folderName,
          limit
        }
      });

    } finally {
      mailbox.release();
      await client.logout();
    }

  } catch (error) {
    console.error('IMAP fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch emails from inbox',
      details: error.message
    });
  }
}

// Helper function to find customer by email
async function findCustomerByEmail(email) {
  try {
    const { CustomerDAO } = await import('../../lib/database.js');
    const customers = await CustomerDAO.findAll({ search: email });
    return customers.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
  } catch (error) {
    console.error('Error finding customer:', error);
    return null;
  }
}