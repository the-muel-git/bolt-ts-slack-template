import type { App } from '@slack/bolt';
import sampleViewCallback from './sample-view';
import messageReplyViewCallback from './message-reply-view';

const register = (app: App) => {
  app.view('sample_view_id', sampleViewCallback);
  app.view('message_reply_view', messageReplyViewCallback);
};

export default { register };
