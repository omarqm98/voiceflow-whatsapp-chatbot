# Voiceflow ↔ WhatsApp ↔ Intercom Integration To Deploy WhatsApp Chatbots With Human In The Loop Feature 

This is a custom backend "Traffic Controller" that connects **Meta's WhatsApp API** with **Voiceflow** (for AI logic) and **Intercom** (for human support).

It allows you to have a sophisticated AI chatbot on WhatsApp that can seamlessly hand off conversation to a human agent in Intercom without the user ever leaving the chat.

## ✨ Key Features
* **Smart Buffering:** Waits 7 seconds to group user messages (e.g., "Hello" + "Price?") into one prompt for Voiceflow. No more spammy bot interruptions. Feel free to modify the sleep timer if as you want.
* **Native Intercom Handoff:** Uses a `talk_to_agent` trace to pause the AI and connect a human agent.
* **Two-Way Sync:** Agent replies in Intercom appear instantly on WhatsApp.
* **Redis State Management:** Tracks who is talking to a bot vs. a human in real-time.
* **Airtable Logging:** Automatically logs new leads/conversations.

## 🛠️ Tech Stack
* Node.js (Express)
* Redis (Database)
* Axios (API Requests)

## ⚙️ Configuration (The "Secret Sauce")
This project relies on a `.env` file. You need to create one and fill in these values:

```bash
# META (WhatsApp)
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_BUSINESS_ACCOUNT_ID=
META_WEBHOOK_VERIFICATION_TOKEN=
META_GRAPH_API_URL=[https://graph.facebook.com/v20.0](https://graph.facebook.com/v20.0)
META_MEDIA_PATH= # Your public URL + /media/meta

# VOICEFLOW
VF_API_KEY=
VF_RUNTIME_API_URL=[https://general-runtime.voiceflow.com](https://general-runtime.voiceflow.com)
VF_PROJECT_ID=

# INTERCOM
INTERCOM_ACCESS_TOKEN=
INTERCOM_DEFAULT_ADMIN_ID=
INTERCOM_API_URL=[https://api.intercom.io](https://api.intercom.io)
INTERCOM_VALID_US_IPS_URL=[https://api.intercom.io/health/params](https://api.intercom.io/health/params)

# REDIS & AIRTABLE
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
AT_ACCESS_TOKEN=
AT_BASE_ID=
AT_CONVERSATION_TABLE_ID= # Columns must be: "phoneNumber" and "name"

# SETTINGS
CLOSE_CHAT_MESSAGE="The agent has closed the chat. You are back with the bot."
