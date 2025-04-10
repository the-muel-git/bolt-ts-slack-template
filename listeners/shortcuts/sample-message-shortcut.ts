import type { AllMiddlewareArgs, MessageShortcut, SlackShortcutMiddlewareArgs } from '@slack/bolt';

const sampleMessageShortcutCallback = async ({
  shortcut,
  ack,
  client,
  logger,
}: AllMiddlewareArgs & SlackShortcutMiddlewareArgs<MessageShortcut>) => {
  try {
    // Acknowledge the shortcut request
    await ack();

    // Get the message that the shortcut was triggered on
    const message = shortcut.message;
    
    if (!message || !message.text) {
      logger.error('No message content found');
      return;
    }

    // Process the message text (in this example, we're just showing it in a modal)
    const messageText = message.text;
    const channel = shortcut.channel.id;
    const messageTs = message.ts;

    // Open a modal to show the message content
    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'sample_message_view_id',
        title: {
          type: 'plain_text',
          text: 'Message Processing',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Message content:*',
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${messageText}`,
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Would you like to take action on this message?*',
            }
          },
          {
            type: 'actions',
            block_id: 'message_actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Add reaction',
                },
                action_id: 'add_reaction',
                value: JSON.stringify({ channel, messageTs }),
                style: 'primary'
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Reply to message',
                },
                action_id: 'reply_to_message',
                value: JSON.stringify({ channel, messageTs }),
              }
            ]
          }
        ],
        close: {
          type: 'plain_text',
          text: 'Close',
        }
      }
    });
  } catch (error) {
    logger.error('Error processing message shortcut:', error);
  }
};

export default sampleMessageShortcutCallback; 