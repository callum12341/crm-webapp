// api/database/tasks.js - Task CRUD operations
import { TaskDAO } from '../../lib/database.js';

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
        const tasks = await TaskDAO.findAll(filters);
        return res.status(200).json({
          success: true,
          data: tasks,
          count: tasks.length
        });

      case 'POST':
        const newTask = await TaskDAO.create(req.body);
        return res.status(201).json({
          success: true,
          data: newTask,
          message: 'Task created successfully'
        });

      case 'PUT':
        const { id, ...updateData } = req.body;
        if (!id) {
          return res.status(400).json({
            success: false,
            message: 'Task ID is required'
          });
        }
        
        const updatedTask = await TaskDAO.update(id, updateData);
        return res.status(200).json({
          success: true,
          data: updatedTask,
          message: 'Task updated successfully'
        });

      case 'DELETE':
        const { taskId } = req.query;
        if (!taskId) {
          return res.status(400).json({
            success: false,
            message: 'Task ID is required'
          });
        }
        
        const deletedTask = await TaskDAO.delete(taskId);
        return res.status(200).json({
          success: true,
          data: deletedTask,
          message: 'Task deleted successfully'
        });

      default:
        return res.status(405).json({
          success: false,
          message: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Task API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database operation failed',
      error: error.message
    });
  }
}