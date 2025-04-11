import type { App } from '@slack/bolt';
import appHomeOpenedCallback from './app-home-opened';
import appMentionCallback from './app-mention';
import linkSharedCallback from './link-shared';

const register = (app: App) => {
  app.event('app_home_opened', appHomeOpenedCallback);
  app.event('app_mention', appMentionCallback);
  app.event('link_shared', linkSharedCallback);
};

export default { register };
