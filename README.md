# Bolt for JavaScript (TypeScript) Template App

This is a generic Bolt for JavaScript (TypeScript) template app used to build out Slack apps.

Before getting started, make sure you have a development workspace where you have permissions to install apps. If you don't have one setup, go ahead and [create one](https://slack.com/create).

## Installation

#### Create a Slack App

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and choose "From an app manifest"
2. Choose the workspace you want to install the application to
3. Copy the contents of [manifest.json](./manifest.json) into the text box that says `*Paste your manifest code here*` (within the JSON tab) and click _Next_
4. Review the configuration and click _Create_
5. Click _Install to Workspace_ and _Allow_ on the screen that follows. You'll then be redirected to the App Configuration dashboard.

#### Environment Variables

Before you can run the app, you'll need to store some environment variables.

1. Copy `env.sample` to `.env`
2. Open your apps configuration page from [this list](https://api.slack.com/apps), click _OAuth & Permissions_ in the left hand menu, then copy the _Bot User OAuth Token_ into your `.env` file under `SLACK_BOT_TOKEN`
3. Click _Basic Information_ from the left hand menu and follow the steps in the _App-Level Tokens_ section to create an app-level token with the `connections:write` scope. Copy that token into your `.env` as `SLACK_APP_TOKEN`.

#### Install Dependencies

`npm install`

#### Run Bolt Server

`npm start`

## Project Structure

### `manifest.json`

`manifest.json` is a configuration for Slack apps. With a manifest, you can create an app with a pre-defined configuration, or adjust the configuration of an existing app.

### `app.ts`

`app.ts` is the entry point for the application and is the file you'll run to start the server. This project aims to keep this file as thin as possible, primarily using it as a way to route inbound requests.

### `/listeners`

Every incoming request is routed to a "listener". Inside this directory, we group each listener based on the Slack Platform feature used, so `/listeners/shortcuts` handles incoming [Shortcuts](https://api.slack.com/interactivity/shortcuts) requests, `/listeners/views` handles [View submissions](https://api.slack.com/reference/interaction-payloads/views#view_submission) and so on.

## Internal Knowledge Base Feature

This app includes a message shortcut that allows users to save important Slack messages to an internal knowledge base. The feature is designed to help teams capture and organize valuable information shared in conversations.

### How It Works

1. Find an important message in any channel
2. Click the "..." menu (three dots) on the message
3. Select "Save to Internal KB" from the shortcuts menu
4. Fill in details like title, category, and tags
5. Click "Save to KB" to store the information

The app will save the message content along with metadata and send a confirmation with the KB entry details to the user who saved it.

#### Message Shortcuts

This app primarily uses message shortcuts that appear in the message actions menu (three dots menu on a message). Message shortcuts allow users to quickly perform actions on specific messages.

## App Distribution / OAuth

Only implement OAuth if you plan to distribute your application across multiple workspaces. A separate `app-oauth.ts` file can be found with relevant OAuth settings.

When using OAuth, Slack requires a public URL where it can send requests. In this template app, we've used [`ngrok`](https://ngrok.com/download). Checkout [this guide](https://ngrok.com/docs#getting-started-expose) for setting it up.

Start `ngrok` to access the app on an external network and create a redirect URL for OAuth.

```
ngrok http 3000
```

This output should include a forwarding address for `http` and `https` (we'll use `https`). It should look something like the following:

```
Forwarding   https://3cb89939.ngrok.io -> http://localhost:3000
```

Navigate to **OAuth & Permissions** in your app configuration and click **Add a Redirect URL**. The redirect URL should be set to your `ngrok` forwarding address with the `slack/oauth_redirect` path appended. For example:

```
https://3cb89939.ngrok.io/slack/oauth_redirect
```

## Deployment

This app is deployed on Railway at https://bolt-ts-slack-template-production.up.railway.app/.

For Slack event subscriptions and interactivity, the app uses the following endpoints:
- Events URL: https://bolt-ts-slack-template-production.up.railway.app/slack/events
- Interactivity Request URL: https://bolt-ts-slack-template-production.up.railway.app/slack/events

To set up your own deployment:
1. Create a Railway account and project
2. Connect your GitHub repository
3. Set up the required environment variables in Railway
4. Configure the URLs in your Slack app settings in the Slack API dashboard

## Slack App Configuration

After deploying your app to Railway (or another hosting provider), you'll need to configure several settings in the Slack API dashboard:

### Basic Information
1. Navigate to [Your Apps](https://api.slack.com/apps) and select your app
2. Under "Basic Information", verify your app's name, description, and icon

### App Credentials
1. Under "Basic Information", note the "Signing Secret" - you'll need this for your `SLACK_SIGNING_SECRET` environment variable
2. If not already done, set up the required environment variables in Railway:
   - `SLACK_BOT_TOKEN`: Your bot's OAuth token
   - `SLACK_SIGNING_SECRET`: Your app's signing secret
   - `SLACK_CLIENT_ID` and `SLACK_CLIENT_SECRET`: Only needed if using OAuth installation flow

### Interactivity & Shortcuts
1. In the left sidebar, click "Interactivity & Shortcuts"
2. Toggle "Interactivity" to On
3. Set the Request URL to: `https://bolt-ts-slack-template-production.up.railway.app/slack/events`
4. Under "Shortcuts", verify that your message shortcut is configured:
   - Name: "Save to Internal KB"
   - Short Description: "Save this message to internal knowledge base"
   - Callback ID: "note_internal_kb"
   - Type: Message

### Event Subscriptions
1. In the left sidebar, click "Event Subscriptions"
2. Toggle "Enable Events" to On
3. Set the Request URL to: `https://bolt-ts-slack-template-production.up.railway.app/slack/events`
4. Under "Subscribe to bot events", verify that the following events are subscribed:
   - `app_home_opened`
   - `message.channels`
5. Click "Save Changes"

### OAuth & Permissions
1. In the left sidebar, click "OAuth & Permissions"
2. Under "Redirect URLs", add your app's OAuth redirect URL if using the OAuth flow
3. Under "Bot Token Scopes", verify that the following scopes are enabled:
   - `channels:history`
   - `chat:write`
   - `connections:write`
   - `channels:join`
   - `commands`
   - `reactions:read`
4. If you need to reinstall your app, click "Install to Workspace" to get a new Bot Token

### App Home
1. In the left sidebar, click "App Home"
2. Toggle "Home Tab" to On
3. Toggle "Messages Tab" based on your preference
4. Make sure "Allow users to send Slash commands and messages from the messages tab" is set according to your needs

After completing these configurations, your Slack app should be fully functional and ready to use with your Railway deployment.

## Handling Events API URL Verification

When configuring the Events API in your Slack app, Slack sends a verification request to your Request URL to confirm that your server can respond properly. This is called the URL Verification challenge.

If you're having trouble with URL verification, you can use one of these approaches:

### Option 1: Use the Standalone Verification Server

For the initial URL verification, you can deploy the standalone verification handler:

1. Deploy `url-verification-handler.ts` to Railway
2. Configure your Slack app's Events Request URL to point to your Railway deployment
3. Once verified, switch to your main app

```bash
# Install dependencies
npm install express body-parser @types/express

# Compile and run
npx tsc url-verification-handler.ts
node url-verification-handler.js
```

### Option 2: Modify app.ts to Handle Verification

If you prefer to modify your main app, you can use `ExpressReceiver` to handle the verification:

```typescript
import { App, LogLevel, ExpressReceiver } from '@slack/bolt';

// Create a custom receiver
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET || '',
  processBeforeResponse: true,
});

// Handle URL verification challenge
receiver.router.post('/slack/events', (req, res, next) => {
  if (req.body && req.body.type === 'url_verification') {
    return res.json({ challenge: req.body.challenge });
  }
  next();
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
  // other options...
});
```

### Verification Request Format

The URL verification request from Slack looks like this:

```json
{
  "token": "Jhj5dZrVaK7ZwHHjRyZWjbDl",
  "challenge": "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
  "type": "url_verification"
}
```

Your server needs to respond with:

```json
{ "challenge": "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P" }
```

For more details, see the [Slack Events API documentation](https://api.slack.com/events/url_verification).
