// api/email/sync.js - Email synchronization service
import { EmailDAO, CustomerDAO } from '../../lib/database.js';

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

  try {
    if (req.method === 'POST') {
      // Perform full email sync
      const { mode = 'recent', hours = 24 } = req.body;
      
      return await performEmailSync(mode, hours, res);
    }

    if (req.method === 'GET') {
      // Get sync status and statistics
      return await getSyncStatus(res);
    }

  } catch (error) {
    console.error('Email sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Email sync failed',
      error: error.message
    });
  }
}

async function performEmailSync(mode, hours, res) {
  const startTime = Date.now();
  const results = {
    newEmails: 0,
    updatedEmails: 0,
    matchedCustomers: 0,
    errors: []
  };

  try {
    // 1. Fetch new emails from IMAP
    console.log('Starting IMAP fetch...');
    const imapResponse = await fetch('/api/email/fetch-inbox', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        folderName: 'INBOX',
        limit: mode === 'full' ? 500 : 100,
        since: mode === 'recent' ? new Date(Date.now() - hours * 60 * 60 * 1000).toISOString() : null
      })
    });

    if (imapResponse.ok) {
      const imapResult = await imapResponse.json();
      if (imapResult.success) {
        results.newEmails = imapResult.emailsProcessed.length;
      }
    }

    // 2. Match unmatched emails with customers
    console.log('Matching emails with customers...');
    const unmatchedEmails = await EmailDAO.findAll({ customer_id: null });
    
    for (const email of unmatchedEmails.slice(0, 50)) { // Limit to prevent timeout
      try {
        const customer = await findCustomerByEmail(email.from_email) || 
                          await findCustomerByEmail(email.to_email);
        
        if (customer) {
          await EmailDAO.update(email.id, {
            customer_id: customer.id,
            customer_name: customer.name
          });
          results.matchedCustomers++;
        }
      } catch (error) {
        results.errors.push({
          emailId: email.id,
          error: error.message
        });
      }
    }

    // 3. Update email thread grouping
    console.log('Grouping email threads...');
    await groupEmailThreads();

    // 4. Generate email insights
    console.log('Generating insights...');
    const insights = await generateEmailInsights();

    const syncTime = Date.now() - startTime;

    return res.status(200).json({
      success: true,
      message: `Email sync completed in ${syncTime}ms`,
      results,
      insights,
      performance: {
        syncTime,
        mode,
        processedEmails: results.newEmails + results.matchedCustomers
      }
    });

  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({
      success: false,
      message: 'Email sync failed',
      error: error.message,
      partialResults: results
    });
  }
}

async function getSyncStatus(res) {
  try {
    const stats = await EmailDAO.getEmailStats();
    const recentSync = await getLastSyncInfo();
    
    return res.status(200).json({
      success: true,
      stats,
      lastSync: recentSync,
      recommendations: generateSyncRecommendations(stats)
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to get sync status',
      error: error.message
    });
  }
}

async function findCustomerByEmail(email) {
  if (!email) return null;
  
  try {
    const customers = await CustomerDAO.findAll({ search: email });
    return customers.find(c => 
      c.email.toLowerCase() === email.toLowerCase()
    ) || null;
  } catch (error) {
    console.error('Error finding customer by email:', error);
    return null;
  }
}

async function groupEmailThreads() {
  try {
    // Group emails by subject and participants
    const emails = await EmailDAO.findAll({ limit: 1000 });
    const threadGroups = new Map();

    emails.forEach(email => {
      const threadKey = generateThreadKey(email);
      if (!threadGroups.has(threadKey)) {
        threadGroups.set(threadKey, []);
      }
      threadGroups.get(threadKey).push(email);
    });

    // Update thread IDs for grouped emails
    for (const [threadKey, threadEmails] of threadGroups) {
      if (threadEmails.length > 1) {
        const threadId = `thread_${threadKey}`;
        for (const email of threadEmails) {
          await EmailDAO.update(email.id, { thread_id: threadId });
        }
      }
    }
  } catch (error) {
    console.error('Error grouping threads:', error);
  }
}

function generateThreadKey(email) {
  // Create a thread key based on subject and participants
  const subject = email.subject.replace(/^(Re:|Fwd?:)\s*/i, '').trim();
  const participants = [email.from_email, email.to_email]
    .filter(Boolean)
    .sort()
    .join('|');
  
  return `${subject}|${participants}`.toLowerCase();
}

async function generateEmailInsights() {
  try {
    const stats = await EmailDAO.getEmailStats();
    
    return {
      summary: {
        totalEmails: parseInt(stats.total),
        responseRate: stats.outgoing > 0 ? 
          Math.round((stats.outgoing / (stats.incoming + stats.outgoing)) * 100) : 0,
        avgEmailsPerWeek: Math.round(parseInt(stats.this_week)),
        unreadCount: parseInt(stats.unread)
      },
      trends: {
        weeklyGrowth: Math.round(
          ((parseInt(stats.this_week) / Math.max(parseInt(stats.this_month) - parseInt(stats.this_week), 1)) - 1) * 100
        ),
        engagement: stats.starred > 0 ? 
          Math.round((parseInt(stats.starred) / parseInt(stats.total)) * 100) : 0
      }
    };
  } catch (error) {
    console.error('Error generating insights:', error);
    return null;
  }
}

async function getLastSyncInfo() {
  // This would typically be stored in database
  // For now, return a mock last sync time
  return {
    lastSyncTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    status: 'completed',
    emailsProcessed: 23
  };
}

function generateSyncRecommendations(stats) {
  const recommendations = [];
  
  if (parseInt(stats.unread) > 10) {
    recommendations.push({
      type: 'warning',
      message: `You have ${stats.unread} unread emails. Consider reviewing them.`,
      action: 'Review unread emails'
    });
  }
  
  if (parseInt(stats.this_week) < 5) {
    recommendations.push({
      type: 'info',
      message: 'Low email activity this week. Consider reaching out to customers.',
      action: 'Schedule customer outreach'
    });
  }
  
  return recommendations;
}