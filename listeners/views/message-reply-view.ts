import type { AllMiddlewareArgs, SlackViewMiddlewareArgs, ViewSubmitAction } from '@slack/bolt';

const messageReplyViewCallback = async ({
  ack,
  view,
  body,
  logger,
}: AllMiddlewareArgs & SlackViewMiddlewareArgs<ViewSubmitAction>) => {
  await ack();
  logger.info('Message reply view submitted');
  // Access user via body.user instead of view.user if needed
  // const userId = body.user.id;
  // Implementation will be added once we fix TypeScript issues
};

export default messageReplyViewCallback; 