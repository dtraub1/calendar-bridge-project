const express = require('express');
const { google } = require('googleapis');
const User = require('../models/User');
const { generateJWT, verifyJWT } = require('../utils/jwt');

const router = express.Router();

// Configure OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.CLIENT_URL}/auth/callback`
);

// Start OAuth flow
router.get('/google', (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent', // Always get refresh token
  });

  res.redirect(authUrl);
});

// Handle OAuth callback
router.post('/callback', async (req, res, next) => {
  try {
    const { code } = req.body;
    
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    // Get user info
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const { data } = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names',
    });
    
    const email = data.emailAddresses[0].value;
    const name = data.names[0].displayName;
    const googleId = data.resourceName.split('/')[1];
    
    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (user) {
      // Update tokens
      user.tokens = tokens;
      user.name = name;
      user.email = email;
    } else {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        tokens,
      });
    }
    
    await user.save();
    
    // Create JWT for authentication
    const token = generateJWT({ userId: user._id });
    
    // Set JWT as cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Check authentication status
router.get('/status', async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.json({ authenticated: false });
    }
    
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return res.json({ authenticated: false });
    }
    
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.json({ authenticated: false });
    }
    
    res.json({ authenticated: true });
  } catch (error) {
    console.error('Auth status error:', error);
    res.json({ authenticated: false });
  }
});

// Disconnect calendar
router.post('/disconnect', async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    
    if (!token) {
      return res.status(401).json({ error: true, message: 'Not authenticated' });
    }
    
    const decoded = verifyJWT(token);
    
    if (!decoded) {
      return res.status(401).json({ error: true, message: 'Invalid token' });
    }
    
    await User.findByIdAndDelete(decoded.userId);
    
    res.clearCookie('auth_token');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

module.exports = router;