import type { AllMiddlewareArgs, SlackViewMiddlewareArgs } from '@slack/bolt';

// Simple in-memory store for KB entries (would be replaced with a database in production)
const kbEntries: KbEntry[] = [];

interface KbEntry {
  id: string;
  title: string;
  category: string;
  tags: string[];
  content: string;
  notes?: string;
  author: string;
  sourceUrl: string;
  createdBy: string;
  createdAt: Date;
}

const kbEntryViewCallback = async ({
  view,
  ack,
  client,
  body,
  logger,
}: AllMiddlewareArgs & SlackViewMiddlewareArgs) => {
  try {
    await ack();

    // Get form values
    const title = view.state.values.kb_title.title.value || 'Untitled KB Entry';
    const category = view.state.values.kb_category.category.selected_option?.value || 'other';
    const tagsRaw = view.state.values.kb_tags.tags.value || '';
    const notes = view.state.values.kb_notes.notes.value || '';
    const messageInfoRaw = view.state.values.message_info.message_ref.value || '{}';

    // Process tags
    const tags = tagsRaw
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // Parse message information
    const messageInfo = JSON.parse(messageInfoRaw);
    const { text, author, messageUrl } = messageInfo;

    // Create KB entry
    const newEntry: KbEntry = {
      id: `kb-${Date.now()}`,
      title,
      category,
      tags,
      content: text,
      notes: notes || undefined,
      author,
      sourceUrl: messageUrl,
      createdBy: body.user.id,
      createdAt: new Date(),
    };

    // Save entry (in-memory for demo purposes)
    kbEntries.push(newEntry);

    logger.info(`New KB entry created: ${newEntry.id} - ${newEntry.title}`);

    // Format entry for display
    const formattedEntry = `
*${newEntry.title}*
Category: ${newEntry.category}
${newEntry.tags.length > 0 ? `Tags: ${newEntry.tags.join(', ')}` : ''}

*Content:*
${newEntry.content}

${newEntry.notes ? `*Additional Notes:*\n${newEntry.notes}\n\n` : ''}
_Original message from ${newEntry.author} | <${newEntry.sourceUrl}|View in Slack>_
    `.trim();

    // Notify the user that the entry was saved
    try {
      await client.chat.postMessage({
        channel: body.user.id,
        text: ':white_check_mark: Knowledge Base entry saved successfully!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: ':white_check_mark: *Knowledge Base entry saved successfully!*',
            },
          },
          {
            type: 'divider',
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: formattedEntry,
            },
          },
        ],
      });
    } catch (dmError) {
      logger.error('Error sending confirmation DM:', dmError);
    }

    // In a real implementation, you would:
    // 1. Save to a database instead of memory
    // 2. Index for searchability
    // 3. Possibly trigger a workflow
    // 4. Maybe post to a designated KB channel
  } catch (error) {
    logger.error('Error saving KB entry:', error);
  }
};

export default kbEntryViewCallback;
