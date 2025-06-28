import type { App } from '@slack/bolt';
import { addReactionHandler, replyToMessageHandler } from './message-actions';
import sampleActionCallback from './sample-action';

const register = (app: App) => {
  app.action('sample_action_id', sampleActionCallback);
  app.action('add_reaction', addReactionHandler);
  app.action('reply_to_message', replyToMessageHandler);
};

export default { register };
