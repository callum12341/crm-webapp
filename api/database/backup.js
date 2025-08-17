// api/database/backup.js - Database backup functionality
import { VercelDatabase, CustomerDAO, TaskDAO, EmailDAO, EmailTemplateDAO } from '../../lib/database.js';

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
      // Create full database backup
      const backup = {
        metadata: {
          backupDate: new Date().toISOString(),
          version: '1.0.0',
          source: 'CRM WebApp'
        },
        customers: await CustomerDAO.exportAll(),
        tasks: await TaskDAO.exportAll(),
        emails: await EmailDAO.exportAll(),
        emailTemplates: await EmailTemplateDAO.findAll()
      };

      const backupSize = JSON.stringify(backup).length;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="crm_backup_${Date.now()}.json"`);
      
      return res.status(200).json({
        success: true,
        backup,
        metadata: {
          ...backup.metadata,
          totalRecords: {
            customers: backup.customers.length,
            tasks: backup.tasks.length,
            emails: backup.emails.length,
            emailTemplates: backup.emailTemplates.length
          },
          backupSize
        }
      });
    }

    if (req.method === 'GET') {
      // Get database statistics for backup info
      const stats = {
        customers: (await CustomerDAO.findAll()).length,
        tasks: (await TaskDAO.findAll()).length,
        emails: (await EmailDAO.findAll()).length,
        emailTemplates: (await EmailTemplateDAO.findAll()).length
      };

      return res.status(200).json({
        success: true,
        stats,
        lastBackupAvailable: false, // This would be tracked in a real system
        recommendedBackupFrequency: 'daily'
      });
    }

  } catch (error) {
    console.error('Backup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Backup failed',
      error: error.message
    });
  }
}