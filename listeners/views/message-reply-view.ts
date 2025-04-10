import type { AllMiddlewareArgs, SlackViewMiddlewareArgs } from '@slack/bolt';

const messageReplyViewCallback = async ({
  view,
  ack,
  client,
  logger,
}: AllMiddlewareArgs & SlackViewMiddlewareArgs) => {
  await ack();

  try {
    // Get the values from the view state
    const replyText = view.state.values.reply_input.reply_text.value;
    const messageRefValue = view.state.values.channel_message_info.message_ref.value;
    
    if (!replyText || !messageRefValue) {
      logger.error('Missing required values for reply');
      return;
    }

    // Parse the message reference to get channel and timestamp
    const { channel, messageTs } = JSON.parse(messageRefValue);

    // Post the reply as a thread reply to the original message
    await client.chat.postMessage({
      channel,
      thread_ts: messageTs,
      text: replyText
    });

    // Optional: DM the user to confirm the reply was sent
    try {
      const userId = view.user.id;
      await client.chat.postMessage({
        channel: userId,
        text: `:white_check_mark: Your reply has been posted to the thread.`
      });
    } catch (dmError) {
      // Log but don't fail if the DM fails
      logger.error('Error sending confirmation DM:', dmError);
    }
  } catch (error) {
    logger.error('Error posting reply:', error);
  }
};

export default messageReplyViewCallback; 