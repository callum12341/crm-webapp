// api/database/init.js - Working version with database connection
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'CORS OK' });
  }

  try {
    // Get database URL
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    
    if (!databaseUrl) {
      return res.status(400).json({
        success: false,
        message: 'No database URL found',
        availableEnvVars: Object.keys(process.env).filter(key => 
          key.includes('DATABASE') || key.includes('POSTGRES')
        )
      });
    }

    // Import @vercel/postgres
    let sql;
    try {
      const postgres = await import('@vercel/postgres');
      sql = postgres.sql;
    } catch (importError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to import @vercel/postgres',
        error: importError.message,
        suggestion: 'Make sure @vercel/postgres is installed'
      });
    }

    // Test database connection
    let connectionTest;
    try {
      const result = await sql`SELECT NOW() as current_time, version() as version`;
      connectionTest = {
        success: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].version
      };
    } catch (dbError) {
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: dbError.message,
        code: dbError.code
      });
    }

    // If it's a GET request, just return connection test
    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        message: 'Database connection successful',
        connectionInfo: connectionTest
      });
    }

    // If it's a POST request, also initialize tables
    if (req.method === 'POST') {
      try {
        // Create customers table
        await sql`
          CREATE TABLE IF NOT EXISTS customers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50),
            company VARCHAR(255),
            address TEXT,
            status VARCHAR(50) DEFAULT 'Lead',
            source VARCHAR(100) DEFAULT 'Manual',
            order_value DECIMAL(10,2) DEFAULT 0,
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            last_contact TIMESTAMP WITH TIME ZONE
          )
        `;

        // Create tasks table
        await sql`
          CREATE TABLE IF NOT EXISTS tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            customer_id UUID,
            customer_name VARCHAR(255),
            assigned_to VARCHAR(255),
            assigned_to_email VARCHAR(255),
            priority VARCHAR(20) DEFAULT 'Medium',
            status VARCHAR(20) DEFAULT 'Pending',
            due_date DATE,
            tags TEXT[],
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // Create emails table
        await sql`
          CREATE TABLE IF NOT EXISTS emails (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            customer_id UUID,
            customer_name VARCHAR(255),
            subject VARCHAR(500) NOT NULL,
            from_email VARCHAR(255) NOT NULL,
            to_email VARCHAR(255) NOT NULL,
            cc_email VARCHAR(255),
            bcc_email VARCHAR(255),
            body TEXT NOT NULL,
            type VARCHAR(20) NOT NULL,
            status VARCHAR(20) DEFAULT 'sent',
            priority VARCHAR(20) DEFAULT 'normal',
            is_read BOOLEAN DEFAULT true,
            is_starred BOOLEAN DEFAULT false,
            thread_id VARCHAR(100),
            smtp_message_id VARCHAR(255),
            attachments JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // Create email templates table
        await sql`
          CREATE TABLE IF NOT EXISTS email_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            subject VARCHAR(500) NOT NULL,
            body TEXT NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          )
        `;

        // Insert default email templates if they don't exist
        const templateCheck = await sql`SELECT COUNT(*) as count FROM email_templates`;
        if (templateCheck.rows[0].count === '0') {
          await sql`
            INSERT INTO email_templates (name, subject, body) VALUES
            ('Welcome Email', 'Welcome to {{company_name}}!', 
             'Hi {{customer_name}},\n\nThank you for your interest in our services. We are excited to work with you!\n\nBest regards,\n{{sender_name}}'),
            ('Follow-up Email', 'Following up on our conversation',
             'Hi {{customer_name}},\n\nI wanted to follow up on our recent conversation.\n\nLooking forward to hearing from you.\n\nBest regards,\n{{sender_name}}'),
            ('Proposal Email', 'Proposal for {{project_name}}',
             'Hi {{customer_name}},\n\nPlease find attached our proposal.\n\nBest regards,\n{{sender_name}}')
          `;
        }

        return res.status(200).json({
          success: true,
          message: 'Database initialized successfully!',
          connectionInfo: connectionTest,
          initResult: {
            tablesCreated: ['customers', 'tasks', 'emails', 'email_templates'],
            templatesAdded: templateCheck.rows[0].count === '0' ? 3 : 0
          }
        });

      } catch (initError) {
        return res.status(500).json({
          success: false,
          message: 'Database initialization failed',
          error: initError.message,
          connectionWorked: true // Connection worked, but table creation failed
        });
      }
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Unexpected error',
      error: error.message
    });
  }
}