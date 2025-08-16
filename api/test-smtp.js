export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  try {
    // Test if we can import nodemailer at all
    const nodemailer = await import('nodemailer');
    
    return res.status(200).json({
      success: true,
      message: 'Nodemailer imported successfully!',
      version: nodemailer.default.version || 'unknown',
      hasCreateTransporter: typeof nodemailer.default.createTransporter === 'function'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to import nodemailer',
      error: error.message
    });
  }
}