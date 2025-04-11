import { SlackViewMiddlewareArgs, Middleware, ViewSubmitAction } from "@slack/bolt";

/**
 * Handler for the message reply modal submission
 * This gets triggered when a user submits the message reply modal
 */
export const messageReplyViewCallback: Middleware<SlackViewMiddlewareArgs<ViewSubmitAction>> = async ({ 
  ack, 
  view, 
  client, 
  body, 
  logger 
}) => {
  try {
    // Acknowledge the view submission
    await ack();
    
    // Extract the values from the view state
    const messageText = view.state.values.message_block.message_input.value;
    const channelId = view.private_metadata;
    const threadTs = body.view.callback_id.split('_')[2]; // Assuming callback_id format: 'message_reply_THREAD_TS'
    
    // Log the submission details
    logger.info('Message reply view submitted', {
      user: body.user.id,
      channel: channelId,
      thread: threadTs,
      messageLength: messageText?.length
    });
    
    // Send the reply to the thread
    if (messageText && channelId && threadTs) {
      await client.chat.postMessage({
        channel: channelId,
        thread_ts: threadTs,
        text: messageText,
        // Optional: Add blocks for rich formatting if needed
      });
      
      logger.info('Reply posted successfully to thread', {
        channel: channelId,
        thread: threadTs
      });
    } else {
      logger.error('Missing required data for posting reply', {
        hasMessage: !!messageText,
        hasChannel: !!channelId,
        hasThread: !!threadTs
      });
    }
  } catch (error) {
    logger.error('Error handling message reply view submission', {
      error: error instanceof Error ? error.message : String(error),
      viewId: view.id
    });
  }
}; 