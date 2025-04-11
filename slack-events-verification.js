/**
 * A simple Express server that handles Slack Events API URL verification
 * 
 * Usage:
 * 1. Save this file as slack-events-verification.js
 * 2. Run: npm install express body-parser
 * 3. Run: node slack-events-verification.js
 * 4. Configure your Slack app's Events Subscription URL to point to http://your-server-url/slack/events
 */

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const app = express();
const port = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(bodyParser.json());

// Slack Events API endpoint
app.post('/slack/events', (req, res) => {
  const body = req.body;
  
  console.log('Received request:', JSON.stringify(body, null, 2));
  
  // Handle URL verification challenge
  if (body.type === 'url_verification') {
    console.log('Handling URL verification challenge');
    return res.json({ challenge: body.challenge });
  }
  
  // For other event types, you would add your event handling logic here
  
  // Acknowledge receipt of the event
  res.status(200).send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Listening for Slack events at: /slack/events`);
}); 