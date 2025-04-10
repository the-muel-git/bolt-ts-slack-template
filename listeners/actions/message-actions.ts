import type { AllMiddlewareArgs, ButtonAction, SlackActionMiddlewareArgs } from '@slack/bolt';

// Handler for the Add Reaction button
export const addReactionHandler = async ({
  action,
  ack,
  client,
  logger,
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<ButtonAction>) => {
  await ack();

  try {
    // Parse the value JSON string to get channel and message ts
    const { channel, messageTs } = JSON.parse(action.value);
    
    // Add a reaction to the message (👍 thumbs up)
    await client.reactions.add({
      channel,
      timestamp: messageTs,
      name: 'thumbsup'
    });
    
    // Close the modal
    await client.views.update({
      view_id: action.view.id,
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
              text: '*Success!* Added a 👍 reaction to the message.',
            }
          }
        ],
        close: {
          type: 'plain_text',
          text: 'Close',
        }
      }
    });
  } catch (error) {
    logger.error('Error adding reaction:', error);
  }
};

// Handler for the Reply to Message button
export const replyToMessageHandler = async ({
  action,
  ack,
  client,
  logger,
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<ButtonAction>) => {
  await ack();

  try {
    // Parse the value JSON string to get channel and message ts
    const { channel, messageTs } = JSON.parse(action.value);
    
    // Update the modal to collect reply text
    await client.views.update({
      view_id: action.view.id,
      view: {
        type: 'modal',
        callback_id: 'message_reply_view',
        title: {
          type: 'plain_text',
          text: 'Reply to Message',
        },
        blocks: [
          {
            type: 'input',
            block_id: 'reply_input',
            label: {
              type: 'plain_text',
              text: 'Your reply:',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'reply_text',
              multiline: true,
              placeholder: {
                type: 'plain_text',
                text: 'Type your reply here...'
              }
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `This will be posted as a reply to the selected message in the channel.`
              }
            ]
          },
          {
            type: 'input',
            optional: true,
            block_id: 'channel_message_info',
            label: {
              type: 'plain_text',
              text: 'Message reference:',
            },
            element: {
              type: 'plain_text_input',
              action_id: 'message_ref',
              initial_value: JSON.stringify({ channel, messageTs }),
              disabled: true
            }
          }
        ],
        submit: {
          type: 'plain_text',
          text: 'Send Reply',
        },
        close: {
          type: 'plain_text',
          text: 'Cancel',
        }
      }
    });
  } catch (error) {
    logger.error('Error setting up reply view:', error);
  }
}; 