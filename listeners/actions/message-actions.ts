import type { AllMiddlewareArgs, BlockAction, SlackActionMiddlewareArgs } from '@slack/bolt';

// Simplified handlers to be fully implemented later
export const addReactionHandler = async ({
  ack,
  logger,
  body,
  client,
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>) => {
  await ack();
  try {
    const action = body.actions?.[0];
    if (!action || !('value' in action)) {
      logger.error('Missing action value for add reaction');
      return;
    }

    const { channel, messageTs } = JSON.parse(action.value as string);
    await client.reactions.add({
      channel,
      timestamp: messageTs,
      name: 'thumbsup',
    });
    logger.info('Reaction added successfully');
  } catch (error) {
    logger.error('Error adding reaction:', error);
  }
};

export const replyToMessageHandler = async ({
  ack,
  logger,
  body,
  client,
}: AllMiddlewareArgs & SlackActionMiddlewareArgs<BlockAction>) => {
  await ack();
  try {
    const action = body.actions?.[0];
    if (!action || !('value' in action)) {
      logger.error('Missing action value for reply to message');
      return;
    }

    const { channel, messageTs } = JSON.parse(action.value as string);

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'message_reply_view',
        private_metadata: JSON.stringify({ channel, threadTs: messageTs }),
        title: { type: 'plain_text', text: 'Reply to Message' },
        submit: { type: 'plain_text', text: 'Send' },
        close: { type: 'plain_text', text: 'Cancel' },
        blocks: [
          {
            type: 'input',
            block_id: 'message_block',
            element: {
              type: 'plain_text_input',
              action_id: 'message_input',
              multiline: true,
            },
            label: { type: 'plain_text', text: 'Reply' },
          },
        ],
      },
    });

    logger.info('Opened reply modal');
  } catch (error) {
    logger.error('Error opening reply modal:', error);
  }
};
