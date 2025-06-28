import type { AllMiddlewareArgs, SlackEventMiddlewareArgs } from '@slack/bolt';
import type { LinkUnfurls } from '@slack/types';

const linkSharedCallback = async ({
  event,
  client,
  logger,
}: AllMiddlewareArgs & SlackEventMiddlewareArgs<'link_shared'>) => {
  try {
    // Log the shared links
    logger.info(`Links shared by <@${event.user}>:`, event.links);

    // Example: Unfurl the links
    if (event.links && event.links.length > 0) {
      // You could unfurl the links with additional context
      // This is just a simple example - you would customize this based on your needs
      const unfurls: LinkUnfurls = {};

      for (const link of event.links) {
        // Create custom unfurl content for each link
        // Key must be the exact URL from the message
        unfurls[link.url] = {
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Link saved to knowledge base*\n${link.url}`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Added to KB by <@${event.user}>`,
                },
              ],
            },
          ],
        };
      }

      // Only attempt to unfurl if we have links to unfurl
      if (Object.keys(unfurls).length > 0) {
        await client.chat.unfurl({
          channel: event.channel,
          ts: event.message_ts,
          unfurls: unfurls,
        });
      }
    }
  } catch (error) {
    logger.error('Error handling link shared event:', error);
  }
};

export default linkSharedCallback;
