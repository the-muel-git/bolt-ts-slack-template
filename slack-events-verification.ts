/**
 * A simple Express server that handles Slack Events API URL verification
 *
 * Usage:
 * 1. Save this file as slack-events-verification.ts
 * 2. Run: npm install express body-parser @types/express
 * 3. Run: npx tsc slack-events-verification.ts
 * 4. Run: node slack-events-verification.js
 * 5. Configure your Slack app's Events Subscription URL to point to http://your-server-url/slack/events
 */

import bodyParser from 'body-parser';
import express, { type Request, type Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

// Parse JSON request bodies
app.use(bodyParser.json());

interface UrlVerificationEvent {
  token: string;
  challenge: string;
  type: 'url_verification';
}

// Slack Events API endpoint
app.post('/slack/events', (req: Request, res: Response) => {
  const body = req.body;

  console.log('Received request:', JSON.stringify(body, null, 2));

  // Handle URL verification challenge
  if (body.type === 'url_verification') {
    const verificationEvent = body as UrlVerificationEvent;
    console.log('Handling URL verification challenge');
    res.json({ challenge: verificationEvent.challenge });
  }

  // For other event types, you would add your event handling logic here

  // Acknowledge receipt of the event
  res.status(200).send();
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log('Listening for Slack events at: /slack/events');
});
