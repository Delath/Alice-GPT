const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const adminChatId = process.env.ADMIN_ID;

const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (chatId==adminChatId) {
    openaiCall(msg.text);
  } else {
    bot.sendMessage(adminChatId, "Unauthorized id ("+chatId+") tried to access Alice.");
  }
});

async function openaiCall(input){
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: input }),
    });

    const data = await response.json();
    if (response.status !== 200) {
      throw data.error || new Error(`Request failed with status ${response.status}`);
    }

    bot.sendMessage(adminChatId, data.result);
  } catch(error) {
    // Consider implementing your own error handling logic here
    console.error(error);
  }

}