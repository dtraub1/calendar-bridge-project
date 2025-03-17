const express = require('express');
const { google } = require('googleapis');
const User = require('../models/User');

const router = express.Router();

// API key authentication middleware
const authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
      return res.status(401).json({ error: true, message: 'API key is required' });
    }
    
    const user = await User.findOne({ apiKey });
    
    if (!user) {
      return res.status(401).json({ error: true, message: 'Invalid API key' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// Helper to refresh tokens if needed
const getAuthClient = async (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.CLIENT_URL}/auth/callback`
  );
  
  oauth2Client.setCredentials(user.tokens);
  
  // Check if token is expired and refresh if needed
  if (Date.now() > user.tokens.expiry_date) {
    try {
      const { tokens } = await oauth2Client.refreshToken(user.tokens.refresh_token);
      
      // Update user tokens in database
      user.tokens = tokens;
      await user.save();
      
      oauth2Client.setCredentials(tokens);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw new Error('Failed to refresh authentication token');
    }
  }
  
  return oauth2Client;
};

// Check availability
router.post('/availability', authenticateApiKey, async (req, res, next) => {
  try {
    const { startDate, endDate, duration } = req.body;
    
    if (!startDate || !endDate || !duration) {
      return res.status(400).json({
        error: true,
        message: 'startDate, endDate, and duration are required',
      });
    }
    
    // Parse dates and duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMinutes = parseInt(duration, 10);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || isNaN(durationMinutes)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid date format or duration',
      });
    }
    
    // Get authorized client
    const auth = await getAuthClient(req.user);
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Get busy slots from calendar
    const freeBusy = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: 'primary' }],
      },
    });
    
    const busySlots = freeBusy.data.calendars.primary.busy;
    
    // Generate available time slots
    const availableSlots = [];
    let currentSlot = new Date(start);
    
    // Set working hours (9 AM to 5 PM)
    const workingHoursStart = 9;
    const workingHoursEnd = 17;
    
    while (currentSlot < end) {
      const slotEnd = new Date(currentSlot);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);
      
      // Skip slots outside of working hours
      const hour = currentSlot.getHours();
      if (hour >= workingHoursStart && hour < workingHoursEnd) {
        // Check if slot overlaps with any busy slot
        const isAvailable = !busySlots.some(busySlot => {
          const busyStart = new Date(busySlot.start);
          const busyEnd = new Date(busySlot.end);
          return (
            (currentSlot >= busyStart && currentSlot < busyEnd) ||
            (slotEnd > busyStart && slotEnd <= busyEnd) ||
            (currentSlot <= busyStart && slotEnd >= busyEnd)
          );
        });
        
        if (isAvailable) {
          availableSlots.push({
            start: currentSlot.toISOString(),
            end: slotEnd.toISOString(),
          });
        }
      }
      
      // Move to next slot (30-minute increments)
      currentSlot.setMinutes(currentSlot.getMinutes() + 30);
    }
    
    res.json({
      availableSlots,
    });
  } catch (error) {
    next(error);
  }
});

// Create appointment
router.post('/appointments', authenticateApiKey, async (req, res, next) => {
  try {
    const { 
      startTime, 
      endTime, 
      summary, 
      description, 
      attendeeEmail, 
      attendeeName 
    } = req.body;
    
    if (!startTime || !endTime || !summary) {
      return res.status(400).json({
        error: true,
        message: 'startTime, endTime, and summary are required',
      });
    }
    
    // Get authorized client
    const auth = await getAuthClient(req.user);
    const calendar = google.calendar({ version: 'v3', auth });
    
    // Create event
    const event = {
      summary,
      description: description || '',
      start: {
        dateTime: startTime,
        timeZone: 'America/New_York', // Adjust as needed
      },
      end: {
        dateTime: endTime,
        timeZone: 'America/New_York', // Adjust as needed
      },
    };
    
    // Add attendee if email is provided
    if (attendeeEmail) {
      event.attendees = [{
        email: attendeeEmail,
        name: attendeeName || '',
        responseStatus: 'needsAction',
      }];
    }
    
    const createdEvent = await calendar.events.insert({
      calendarId: 'primary',
      sendUpdates: 'all', // Send emails to attendees
      requestBody: event,
    });
    
    res.json({
      success: true,
      eventId: createdEvent.data.id,
      eventLink: createdEvent.data.htmlLink,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;