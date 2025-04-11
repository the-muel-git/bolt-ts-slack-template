/**
 * Simple Express server for handling Slack Events API URL verification challenge
 * 
 * This is a standalone server that can be deployed to Railway or another hosting provider.
 * It only handles the URL verification challenge, not other event types.
 */

import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(bodyParser.json());

interface SlackUrlVerificationEvent {
  token: string;
  challenge: string;
  type: 'url_verification';
}

// Slack Events API verification endpoint
app.post('/slack/events', (req, res) => {
  console.log('Received request:', JSON.stringify(req.body, null, 2));
  
  const body = req.body;
  
  // Handle URL verification challenge
  if (body && body.type === 'url_verification') {
    const event = body as SlackUrlVerificationEvent;
    console.log('Handling URL verification challenge. Returning:', event.challenge);
    
    // Return the challenge in the format Slack expects
    return res.json({ challenge: event.challenge });
  }
  
  // For all other requests, just acknowledge
  res.status(200).send('Ok');
});

// Start the server
app.listen(port, () => {
  console.log(`URL Verification Server running on port ${port}`);
  console.log('Waiting for Slack verification at: /slack/events');
}); 