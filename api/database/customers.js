// api/database/customers.js - Customer CRUD operations
import { CustomerDAO } from '../../lib/database.js';

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
        const customers = await CustomerDAO.findAll(filters);
        return res.status(200).json({
          success: true,
          data: customers,
          count: customers.length
        });

      case 'POST':
        const newCustomer = await CustomerDAO.create(req.body);
        return res.status(201).json({
          success: true,
          data: newCustomer,
          message: 'Customer created successfully'
        });

      case 'PUT':
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'Customer ID is required'
          });
        }
        
        const updatedCustomer = await CustomerDAO.update(id, updateData);
        return res.status(200).json({
          success: true,
          data: updatedCustomer,
          message: 'Customer updated successfully'
        });

      case 'DELETE':
        const { customerId } = req.query;
        if (!customerId) {
          return res.status(400).json({
            success: false,
            message: 'Customer ID is required'
          });
        }
        
        const deletedCustomer = await CustomerDAO.delete(customerId);
        return res.status(200).json({
          success: true,
          data: deletedCustomer,
          message: 'Customer deleted successfully'
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Customer API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: error.message
    });
  }
}