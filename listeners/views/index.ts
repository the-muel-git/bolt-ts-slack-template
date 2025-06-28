import type { App } from '@slack/bolt';
import kbEntryViewCallback from './kb-entry-view';
import { messageReplyViewCallback } from './message-reply-view';
import sampleViewCallback from './sample-view';

const register = (app: App) => {
  app.view('sample_view_id', sampleViewCallback);
  app.view('kb_entry_view', kbEntryViewCallback);
  app.view('message_reply_view', messageReplyViewCallback);
};

export default { register };
