const jwt = require('jsonwebtoken');
const User = require('../models/User');

const webAuth = async (req, res, next) => {
  try {
    // Check for token in multiple places
    let token = req.cookies?.token || 
                req.query?.token || 
                req.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.redirect('/login');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      // Clear invalid token and redirect to login
      res.clearCookie('token');
      return res.redirect('/login');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    // Clear invalid token and redirect to login
    res.clearCookie('token');
    res.redirect('/login');
  }
};

module.exports = webAuth;
