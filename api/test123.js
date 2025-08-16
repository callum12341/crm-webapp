export default async function handler(req, res) {
  return res.status(200).json({
    message: 'Test123 API is working!',
    timestamp: new Date().toISOString()
  });
}