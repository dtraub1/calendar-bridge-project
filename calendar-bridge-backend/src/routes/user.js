const express = require('express');
const User = require('../models/User');
const { verifyJWT } = require('../utils/jwt');

const router = express.Router();

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: true, message: 'Not authenticated' });
    }
    
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return res.status(401).json({ error: true, message: 'Invalid token' });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Get user info
router.get('/info', authenticate, async (req, res) => {
  res.json({
    name: req.user.name,
    email: req.user.email,
    apiKey: req.user.apiKey,
  });
});

module.exports = router;