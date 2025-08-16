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
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'SendGrid not configured. Please set SENDGRID_API_KEY environment variable.'
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

    // Limit bulk email size
    if (emails.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Too many emails. Maximum 50 emails per batch.'
      });
    }

    console.log(`Processing bulk email request for ${emails.length} emails`);

    const results = [];
    let successful = 0;
    let failed = 0;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Process emails with delay to avoid rate limiting
    for (let i = 0; i < emails.length; i++) {
      const emailData = emails[i];
      
      try {
        // Validate email data
        if (!emailData.to || !emailData.subject || !emailData.body) {
          throw new Error('Missing required fields: to, subject, body');
        }

        if (!emailRegex.test(emailData.to)) {
          throw new Error('Invalid email format');
        }

        // Prepare SendGrid email data
        const sgEmailData = {
          personalizations: [
            {
              to: [{ email: emailData.to }],
              subject: emailData.subject
            }
          ],
          from: { 
            email: emailData.from || 'noreply@yourdomain.com', 
            name: 'Your CRM System' 
          },
          content: [
            {
              type: 'text/plain',
              value: emailData.body
            },
            {
              type: 'text/html',
              value: emailData.body.replace(/\n/g, '<br>')
            }
          ]
        };

        // Add CC and BCC if provided and valid
        if (emailData.cc && emailData.cc.trim() && emailRegex.test(emailData.cc.trim())) {
          sgEmailData.personalizations[0].cc = [{ email: emailData.cc.trim() }];
        }
        if (emailData.bcc && emailData.bcc.trim() && emailRegex.test(emailData.bcc.trim())) {
          sgEmailData.personalizations[0].bcc = [{ email: emailData.bcc.trim() }];
        }

        console.log(`Sending email ${i + 1}/${emails.length} to: ${emailData.to}`);
        
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sgEmailData)
        });

        if (response.ok) {
          const messageId = response.headers.get('x-message-id') || `sg_${Date.now()}_${i}`;
          
          results.push({
            success: true,
            messageId: messageId,
            to: emailData.to,
            customerId: emailData.customerId,
            customerName: emailData.customerName,
            timestamp: new Date().toISOString(),
            service: 'SendGrid'
          });
          
          successful++;
          console.log(`Email ${i + 1} sent successfully: ${messageId}`);
        } else {
          const errorText = await response.text();
          throw new Error(`SendGrid API error: ${errorText}`);
        }

        // Add delay between emails to avoid rate limiting
        if (i < emails.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Email ${i + 1} failed:`, error.message);
        
        results.push({
          success: false,
          error: error.message,
          to: emailData.to,
          customerId: emailData.customerId,
          customerName: emailData.customerName,
          timestamp: new Date().toISOString()
        });
        
        failed++;
      }
    }

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
      service: 'SendGrid',
      timestamp: new Date().toISOString()
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