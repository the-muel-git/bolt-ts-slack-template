import type { App } from '@slack/bolt';
import sampleMessageShortcutCallback from './sample-message-shortcut';

const register = (app: App) => {
  app.shortcut('sample_message_shortcut_id', sampleMessageShortcutCallback);
};

export default { register };
