const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api');
const openaiLib = require("openai");

const Configuration = openaiLib.Configuration;
const OpenAIApi = openaiLib.OpenAIApi;
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);
const adminChatId = process.env.ADMIN_ID;
const adminName = process.env.ADMIN_NAME;
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (chatId==adminChatId) {
    openaiCall(msg.text);
  } else {
    bot.sendMessage(adminChatId, adminName + " an unauthorized id ("+chatId+") is trying to have a conversation with me.");
  }
});

async function openaiCall(input){
  try {
    let memories = '';

    fs.readFile('brain.json', (err, data) => {
      if (err) throw err;

      memories = JSON.parse(data);

      memories[memories.length] = {
        "role": "user",
        "content": input
      }

      const completion = openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: memories,
      }).then(completion => {
        const answer = completion.data.choices[0].message.content;
      
        bot.sendMessage(adminChatId, answer);

        memories[memories.length] = {
          "role": "assistant",
          "content": answer
        }

        var jsonContent = JSON.stringify(memories, null, 4);

        fs.writeFile('brain.json', jsonContent, (err) => {
          if (err) throw err;
          console.log('Alice Memories have been updated!');
        });  
      });
    });
  } catch(error) {
    // Might implement my own error handling logic here
    console.error(error);
  }
};

console.log("Alice has been started.")