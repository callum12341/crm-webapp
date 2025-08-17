// api/database/import.js - Data import functionality
import { DataManager } from '../../lib/database.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const { table, data, options = {} } = req.body;
    
    if (!table || !['customers', 'tasks'].includes(table)) {
      return res.status(400).json({
        success: false,
        message: 'Valid table name is required (customers, tasks)'
      });
    }

    if (!data || !Array.isArray(data)) {
      return res.status(400).json({
        success: false,
        message: 'Data array is required'
      });
    }

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No data to import'
      });
    }

    if (data.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 1000 records per import batch'
      });
    }

    const importResult = await DataManager.importFromJSON(table, data);
    
    return res.status(200).json({
      success: true,
      message: 'Import completed',
      result: importResult,
      table,
      totalRecords: data.length,
      importedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({
      success: false,
      message: 'Import failed',
      error: error.message
    });
  }
}