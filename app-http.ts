import { App, LogLevel, ExpressReceiver } from '@slack/bolt';
import * as dotenv from 'dotenv';
import registerListeners from './listeners';

dotenv.config();

// Create a custom ExpressReceiver for handling verification
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
  processBeforeResponse: true,
});

// Add middleware to handle URL verification challenge
receiver.router.post('/slack/events', (req, res, next) => {
  // Special handling for URL verification challenge
  if (req.body && req.body.type === 'url_verification') {
    console.log('Received URL verification challenge:', req.body.challenge);
    // Return exactly what Slack expects for verification
    return res.json({ challenge: req.body.challenge });
  }
  
  // For other requests, continue with normal Bolt handling
  next();
});

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false, // Explicitly disable Socket Mode
  receiver,
  logLevel: LogLevel.DEBUG,
});

/** Register Listeners */
registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    app.logger.info('⚡️ Bolt app is running! ⚡️');
    app.logger.info('HTTP mode is active, URL verification handler is at: /slack/events');
  } catch (error) {
    app.logger.error('Unable to start App', error);
  }
})(); 