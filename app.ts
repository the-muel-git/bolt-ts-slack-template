import { App, ExpressReceiver, LogLevel } from '@slack/bolt';
import * as dotenv from 'dotenv';
import type { Request, Response } from 'express';
import registerListeners from './listeners';

dotenv.config();

// Create a custom ExpressReceiver for handling verification
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
  processBeforeResponse: true,
});

// Define handleEventTypeURLVerification outside of the middleware to avoid TypeScript errors
const handleEventTypeURLVerification = (req: Request, res: Response): boolean => {
  // Special handling for URL verification challenge
  if (req.body && req.body.type === 'url_verification') {
    console.log('Received URL verification challenge:', req.body.challenge);
    // Return exactly what Slack expects for verification
    res.json({ challenge: req.body.challenge });
    return true;
  }
  return false;
};

// Add middleware to handle URL verification challenge
receiver.router.use('/slack/events', (req, res, next) => {
  if (handleEventTypeURLVerification(req, res)) {
    return; // URL verification was handled
  }
  next();
});

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  receiver,
  socketMode: false, // EXPLICITLY disabling Socket Mode
  logLevel: LogLevel.DEBUG,
});

/** Register Listeners */
registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    console.log('Starting app in HTTP MODE - NOT Socket Mode');
    console.log('socketMode is EXPLICITLY set to FALSE');
    await app.start(process.env.PORT || 3000);
    app.logger.info('⚡️ Bolt app is running! ⚡️');
    app.logger.info('HTTP mode is active, URL verification handler is at: /slack/events');
  } catch (error) {
    app.logger.error('Unable to start App', error);
  }
})();
