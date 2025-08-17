/ api/database/emails.js - Enhanced email CRUD operations
import { EmailDAO } from '../../lib/database.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
        // Create new email record (used when sending emails or importing)
        const newEmail = await EmailDAO.create(req.body);
        return res.status(201).json({
          success: true,
          data: newEmail,
          message: 'Email record created successfully'
        });

      case 'PUT':
        // Update email (mark as read, star, etc.)
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'Email ID is required'
          });
        }
        
        const updatedEmail = await EmailDAO.update(id, updateData);
        return res.status(200).json({
          success: true,
          data: updatedEmail,
          message: 'Email updated successfully'
        });

      case 'DELETE':
        const { emailId } = req.query;
        if (!emailId) {
          return res.status(400).json({
            success: false,
            message: 'Email ID is required'
          });
        }
        
        const deletedEmail = await EmailDAO.delete(Number(emailId));
        return res.status(200).json({
          success: true,
          data: deletedEmail,
          message: 'Email deleted successfully'
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