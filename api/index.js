const app = require('../src/server');
const connectToDatabase = require('../src/utils/database');

module.exports = async (req, res) => {
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('MongoDB Atlas connection error:', error);
    return res.status(503).json({ error: 'Database connection unavailable' });
  }

  return app(req, res);
};
