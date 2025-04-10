import type { App } from '@slack/bolt';
import noteInternalKbCallback from './note-internal-kb';

const register = (app: App) => {
  app.shortcut('note_internal_kb', noteInternalKbCallback);
};

export default { register };
