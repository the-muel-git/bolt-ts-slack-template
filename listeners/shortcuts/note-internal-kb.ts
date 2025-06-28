import type { AllMiddlewareArgs, MessageShortcut, SlackShortcutMiddlewareArgs } from '@slack/bolt';

const noteInternalKbCallback = async ({
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

    // Extract message details
    const messageText = message.text;
    const channel = shortcut.channel.id;
    const messageTs = message.ts;
    const messageUrl = `https://slack.com/archives/${channel}/p${messageTs.replace('.', '')}`;

    // Get user info of message author
    let authorName = 'Unknown User';
    try {
      if (message.user) {
        const userResult = await client.users.info({
          user: message.user,
        });
        if (userResult.user) {
          authorName = userResult.user.real_name || userResult.user.name || 'Unknown User';
        }
      }
    } catch (userError) {
      logger.error('Error fetching user details:', userError);
    }

    // Open a modal to collect KB entry details
    await client.views.open({
      trigger_id: shortcut.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'kb_entry_view',
        title: {
          type: 'plain_text',
          text: 'Save to Internal KB',
        },
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Original Message:*',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${messageText.substring(0, 2900)}${messageText.length > 2900 ? '...' : ''}`,
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'input',
            block_id: 'kb_title',
            label: {
              type: 'plain_text',
              text: 'Title',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'title',
              placeholder: {
                type: 'plain_text',
                text: 'Enter a title for this knowledge base entry',
              },
            },
          },
          {
            type: 'input',
            block_id: 'kb_category',
            label: {
              type: 'plain_text',
              text: 'Category',
            },
            element: {
              type: 'static_select',
              action_id: 'category',
              placeholder: {
                type: 'plain_text',
                text: 'Select a category',
              },
              options: [
                {
                  text: {
                    type: 'plain_text',
                    text: 'Product',
                  },
                  value: 'product',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'Technical',
                  },
                  value: 'technical',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'Process',
                  },
                  value: 'process',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'Customer',
                  },
                  value: 'customer',
                },
                {
                  text: {
                    type: 'plain_text',
                    text: 'Other',
                  },
                  value: 'other',
                },
              ],
            },
          },
          {
            type: 'input',
            block_id: 'kb_tags',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'Tags',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'tags',
              placeholder: {
                type: 'plain_text',
                text: 'Enter comma-separated tags',
              },
            },
          },
          {
            type: 'input',
            block_id: 'kb_notes',
            optional: true,
            label: {
              type: 'plain_text',
              text: 'Additional Notes',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'notes',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'Add any additional context or notes',
              },
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Original message from *${authorName}* | <${messageUrl}|View in Slack>`,
              },
            ],
          },
          {
            type: 'input',
            optional: true,
            block_id: 'message_info',
            label: {
              type: 'plain_text',
              text: 'Message reference',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'message_ref',
              initial_value: JSON.stringify({
                channel,
                messageTs,
                text: messageText,
                author: authorName,
                messageUrl,
              }),
            },
          },
        ],
        submit: {
          type: 'plain_text',
          text: 'Save to KB',
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
        },
      },
    });
  } catch (error) {
    logger.error('Error processing knowledge base shortcut:', error);
  }
};

export default noteInternalKbCallback;
