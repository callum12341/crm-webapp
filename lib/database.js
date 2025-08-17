// lib/database.js - Database connection and data access layer for Vercel
import { sql } from '@vercel/postgres';

// Database utility class optimized for Vercel serverless functions
export class VercelDatabase {
  // Test database connection
  static async testConnection() {
    try {
      const result = await sql`SELECT NOW() as current_time, version() as version`;
      return {
        success: true,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].version,
        connectionInfo: 'Vercel Postgres connected successfully'
      };
    } catch (error) {
      console.error('Database connection error:', error);
      return {
        success: false,
        error: error.message,
        suggestion: 'Check your DATABASE_URL environment variable in Vercel dashboard'
      };
    }
  }

  // Initialize database tables (run once)
  static async initializeDatabase() {
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

      // Create data_exports table for backup tracking
      await sql`
        CREATE TABLE IF NOT EXISTS data_exports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          export_type VARCHAR(50) NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          record_count INTEGER,
          file_size INTEGER,
          status VARCHAR(20) DEFAULT 'completed',
          download_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE
        )
      `;

      // Insert default email templates if they don't exist
      const templateCheck = await sql`SELECT COUNT(*) as count FROM email_templates`;
      if (templateCheck.rows[0].count === 0) {
        await sql`
          INSERT INTO email_templates (name, subject, body) VALUES
          ('Welcome Email', 'Welcome to {{company_name}}!', 
           'Hi {{customer_name}},\n\nThank you for your interest in our services. We''re excited to work with you!\n\nBest regards,\n{{sender_name}}'),
          ('Follow-up Email', 'Following up on our conversation',
           'Hi {{customer_name}},\n\nI wanted to follow up on our recent conversation.\n\nLooking forward to hearing from you.\n\nBest regards,\n{{sender_name}}'),
          ('Proposal Email', 'Proposal for {{project_name}}',
           'Hi {{customer_name}},\n\nPlease find attached our proposal.\n\nBest regards,\n{{sender_name}}')
        `;
      }

      return { success: true, message: 'Database initialized successfully' };
    } catch (error) {
      console.error('Database initialization error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Customer Data Access Object
export class CustomerDAO {
  static async findAll(filters = {}) {
    try {
      let query = sql`
        SELECT id, name, email, phone, company, address, status, source,
               order_value, tags, created_at, updated_at, last_contact
        FROM customers
      `;
      
      if (filters.status) {
        query = sql`
          SELECT id, name, email, phone, company, address, status, source,
                 order_value, tags, created_at, updated_at, last_contact
          FROM customers
          WHERE status = ${filters.status}
        `;
      }
      
      if (filters.search) {
        query = sql`
          SELECT id, name, email, phone, company, address, status, source,
                 order_value, tags, created_at, updated_at, last_contact
          FROM customers
          WHERE name ILIKE ${`%${filters.search}%`} 
             OR email ILIKE ${`%${filters.search}%`}
             OR company ILIKE ${`%${filters.search}%`}
        `;
      }
      
      query = sql`${query} ORDER BY created_at DESC`;
      
      if (filters.limit) {
        query = sql`${query} LIMIT ${filters.limit}`;
      }
      
      const result = await query;
      return result.rows;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  static async findById(id) {
    const result = await sql`
      SELECT * FROM customers WHERE id = ${id}
    `;
    return result.rows[0];
  }

  static async create(customerData) {
    const {
      name, email, phone, company, address, status, source, order_value, tags
    } = customerData;
    
    const result = await sql`
      INSERT INTO customers (name, email, phone, company, address, status, source, order_value, tags)
      VALUES (${name}, ${email}, ${phone || null}, ${company || null}, ${address || null}, 
              ${status || 'Lead'}, ${source || 'Manual'}, ${order_value || 0}, ${tags || []})
      RETURNING *
    `;
    
    return result.rows[0];
  }

  static async update(id, customerData) {
    const {
      name, email, phone, company, address, status, order_value, tags
    } = customerData;
    
    const result = await sql`
      UPDATE customers 
      SET name = ${name}, email = ${email}, phone = ${phone}, company = ${company},
          address = ${address}, status = ${status}, order_value = ${order_value},
          tags = ${tags}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return result.rows[0];
  }

  static async delete(id) {
    const result = await sql`
      DELETE FROM customers WHERE id = ${id} RETURNING *
    `;
    return result.rows[0];
  }

  static async exportAll() {
    const result = await sql`
      SELECT name, email, phone, company, address, status, source, order_value, 
             array_to_string(tags, ',') as tags, created_at, last_contact
      FROM customers 
      ORDER BY created_at DESC
    `;
    return result.rows;
  }
}

// Task Data Access Object
export class TaskDAO {
  static async findAll(filters = {}) {
    try {
      let query = sql`
        SELECT id, title, description, customer_id, customer_name, assigned_to,
               assigned_to_email, priority, status, due_date, tags, created_at, updated_at
        FROM tasks
      `;
      
      if (filters.status) {
        query = sql`${query} WHERE status = ${filters.status}`;
      }
      
      if (filters.customer_id) {
        query = sql`${query} WHERE customer_id = ${filters.customer_id}`;
      }
      
      query = sql`${query} ORDER BY created_at DESC`;
      
      const result = await query;
      return result.rows;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  static async create(taskData) {
    const {
      title, description, customer_id, customer_name, assigned_to, assigned_to_email,
      priority, status, due_date, tags
    } = taskData;
    
    const result = await sql`
      INSERT INTO tasks (title, description, customer_id, customer_name, assigned_to, 
                        assigned_to_email, priority, status, due_date, tags)
      VALUES (${title}, ${description}, ${customer_id}, ${customer_name}, ${assigned_to},
              ${assigned_to_email}, ${priority || 'Medium'}, ${status || 'Pending'}, 
              ${due_date}, ${tags || []})
      RETURNING *
    `;
    
    return result.rows[0];
  }

  static async update(id, taskData) {
    const {
      title, description, customer_id, customer_name, assigned_to, assigned_to_email,
      priority, status, due_date, tags
    } = taskData;
    
    const result = await sql`
      UPDATE tasks 
      SET title = ${title}, description = ${description}, customer_id = ${customer_id},
          customer_name = ${customer_name}, assigned_to = ${assigned_to},
          assigned_to_email = ${assigned_to_email}, priority = ${priority},
          status = ${status}, due_date = ${due_date}, tags = ${tags},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return result.rows[0];
  }

  static async delete(id) {
    const result = await sql`
      DELETE FROM tasks WHERE id = ${id} RETURNING *
    `;
    return result.rows[0];
  }

  static async exportAll() {
    const result = await sql`
      SELECT title, description, customer_name, assigned_to, priority, status, 
             due_date, array_to_string(tags, ',') as tags, created_at
      FROM tasks 
      ORDER BY created_at DESC
    `;
    return result.rows;
  }
}

// Email Data Access Object
export class EmailDAO {
  static async findAll(filters = {}) {
    try {
      let query = sql`
        SELECT id, customer_id, customer_name, subject, from_email, to_email, cc_email,
               bcc_email, body, type, status, priority, is_read, is_starred, thread_id,
               smtp_message_id, attachments, created_at, updated_at
        FROM emails
      `;
      
      if (filters.type) {
        query = sql`${query} WHERE type = ${filters.type}`;
      }
      
      if (filters.customer_id) {
        query = sql`${query} WHERE customer_id = ${filters.customer_id}`;
      }
      
      query = sql`${query} ORDER BY created_at DESC`;
      
      const result = await query;
      return result.rows;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  static async create(emailData) {
    const {
      customer_id, customer_name, subject, from_email, to_email, cc_email, bcc_email,
      body, type, status, priority, is_read, is_starred, thread_id, smtp_message_id, attachments
    } = emailData;
    
    const result = await sql`
      INSERT INTO emails (customer_id, customer_name, subject, from_email, to_email, cc_email,
                         bcc_email, body, type, status, priority, is_read, is_starred, 
                         thread_id, smtp_message_id, attachments)
      VALUES (${customer_id}, ${customer_name}, ${subject}, ${from_email}, ${to_email},
              ${cc_email}, ${bcc_email}, ${body}, ${type}, ${status || 'sent'}, 
              ${priority || 'normal'}, ${is_read || true}, ${is_starred || false},
              ${thread_id}, ${smtp_message_id}, ${JSON.stringify(attachments || [])})
      RETURNING *
    `;
    
    return result.rows[0];
  }

  static async exportAll() {
    const result = await sql`
      SELECT customer_name, subject, from_email, to_email, cc_email, bcc_email,
             body, type, status, priority, created_at
      FROM emails 
      ORDER BY created_at DESC
    `;
    return result.rows;
  }
}

// Email Template Data Access Object
export class EmailTemplateDAO {
  static async findAll() {
    const result = await sql`
      SELECT id, name, subject, body, is_active, created_at
      FROM email_templates 
      WHERE is_active = true
      ORDER BY name
    `;
    return result.rows;
  }

  static async create(templateData) {
    const { name, subject, body } = templateData;
    
    const result = await sql`
      INSERT INTO email_templates (name, subject, body)
      VALUES (${name}, ${subject}, ${body})
      RETURNING *
    `;
    
    return result.rows[0];
  }
}

// Data Export/Import utilities
export class DataManager {
  static async exportToJSON(table) {
    let data;
    
    switch (table) {
      case 'customers':
        data = await CustomerDAO.exportAll();
        break;
      case 'tasks':
        data = await TaskDAO.exportAll();
        break;
      case 'emails':
        data = await EmailDAO.exportAll();
        break;
      default:
        throw new Error('Invalid table name');
    }
    
    const exportRecord = await sql`
      INSERT INTO data_exports (export_type, file_name, record_count, file_size, status)
      VALUES (${table}, ${`${table}_export_${Date.now()}.json`}, ${data.length}, 
              ${JSON.stringify(data).length}, 'completed')
      RETURNING *
    `;
    
    return {
      data,
      exportInfo: exportRecord.rows[0]
    };
  }

  static async getExportHistory() {
    const result = await sql`
      SELECT id, export_type, file_name, record_count, file_size, status, created_at
      FROM data_exports 
      ORDER BY created_at DESC 
      LIMIT 50
    `;
    return result.rows;
  }

  static async importFromJSON(table, data) {
    try {
      let imported = 0;
      let errors = [];

      for (const record of data) {
        try {
          switch (table) {
            case 'customers':
              await CustomerDAO.create(record);
              break;
            case 'tasks':
              await TaskDAO.create(record);
              break;
            default:
              throw new Error('Invalid table name');
          }
          imported++;
        } catch (error) {
          errors.push({ record, error: error.message });
        }
      }

      return {
        success: true,
        imported,
        errors: errors.length,
        errorDetails: errors.slice(0, 10) // Return first 10 errors
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}