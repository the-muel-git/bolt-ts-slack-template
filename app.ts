import { App, LogLevel } from '@slack/bolt';
import * as dotenv from 'dotenv';
import registerListeners from './listeners';

dotenv.config();

/** Initialization */
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel: LogLevel.DEBUG,
  // Use the default endpoints (/slack/events)
  // Railway will route traffic to https://bolt-ts-slack-template-production.up.railway.app/slack/events
});

/** Register Listeners */
registerListeners(app);

/** Start Bolt App */
(async () => {
  try {
    await app.start(process.env.PORT || 3000);
    app.logger.info('⚡️ Bolt app is running! ⚡️');
    app.logger.info('Listening for events at: /slack/events');
  } catch (error) {
    app.logger.error('Unable to start App', error);
  }
})();
