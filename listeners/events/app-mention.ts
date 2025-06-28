import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';

const appMentionCallback = async ({
  event,
  say,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'app_mention'>) => {
  try {
    // Extract the text from the event, removing the app/bot mention
    const text = event.text.replace(/<@[A-Z0-9]+>/, '').trim();

    // Log the mention
    logger.info(`App was mentioned by <@${event.user}> with text: ${text}`);

    // Respond to the mention
    await say({
      text: `Hi <@${event.user}>! Thanks for mentioning me. How can I help with your knowledge base needs?`,
      thread_ts: event.thread_ts || event.ts,
    });
  } catch (error) {
    logger.error('Error handling app mention:', error);
  }
};

export default appMentionCallback;
