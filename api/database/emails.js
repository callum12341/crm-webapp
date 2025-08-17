// api/database/emails.js - Email CRUD operations
import { EmailDAO } from '../../lib/database.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    switch (req.method) {
      case 'GET':
        const filters = req.query;
        const emails = await EmailDAO.findAll(filters);
        return res.status(200).json({
          success: true,
          data: emails,
          count: emails.length
        });

      case 'POST':
        // This will be called when an email is sent to store it in database
        const newEmail = await EmailDAO.create(req.body);
        return res.status(201).json({
          success: true,
          data: newEmail,
          message: 'Email record created successfully'
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Email API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: error.message
    });
  }
}