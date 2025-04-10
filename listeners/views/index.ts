import type { App } from '@slack/bolt';
import sampleViewCallback from './sample-view';
import messageReplyViewCallback from './message-reply-view';
import kbEntryViewCallback from './kb-entry-view';

const register = (app: App) => {
  app.view('sample_view_id', sampleViewCallback);
  app.view('message_reply_view', messageReplyViewCallback);
  app.view('kb_entry_view', kbEntryViewCallback);
};

export default { register };
