// api/database/export.js - Data export functionality
import { DataManager } from '../../lib/database.js';

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
      const { table, format = 'json' } = req.body;
      
      if (!table || !['customers', 'tasks', 'emails'].includes(table)) {
        return res.status(400).json({
          success: false,
          message: 'Valid table name is required (customers, tasks, emails)'
        });
      }

      const exportResult = await DataManager.exportToJSON(table);
      
      if (format === 'csv') {
        // Convert to CSV format
        const csvData = convertToCSV(exportResult.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${table}_export_${Date.now()}.csv"`);
        return res.status(200).send(csvData);
      } else {
        // Return JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${table}_export_${Date.now()}.json"`);
        return res.status(200).json({
          success: true,
          table,
          recordCount: exportResult.data.length,
          exportInfo: exportResult.exportInfo,
          data: exportResult.data,
          exportedAt: new Date().toISOString()
        });
      }
    }

    if (req.method === 'GET') {
      // Get export history
      const history = await DataManager.getExportHistory();
      return res.status(200).json({
        success: true,
        data: history
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({
      success: false,
      message: 'Export failed',
      error: error.message
    });
  }
}

// Utility function to convert JSON to CSV
function convertToCSV(data) {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}