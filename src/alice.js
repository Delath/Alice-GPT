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
  
    fs.readFile('brain.txt', 'utf8', (err, data) => {
      if (err) throw err;
      memories = data;
    });
    
    memories = memories + "\n" + adminName + ": " + input + "\nAlice: "
  
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: memories,
      temperature: 0.5,
      max_tokens: 4000
    });

    const answer = completion.data.choices[0].text;

    bot.sendMessage(adminChatId, answer);

    memories = memories + answer;
  
    fs.writeFile('brain.txt', memories, (err) => {
      if (err) throw err;
      console.log('Alice Memories have been updated!');
    });

  } catch(error) {
    // Might implement my own error handling logic here
    console.error(error);
  }
};