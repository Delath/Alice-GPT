const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const TelegramBot = require('node-telegram-bot-api');

const openaiLib = require("openai");
const Configuration = openaiLib.Configuration;
const OpenAIApi = openaiLib.OpenAIApi;
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const adminChatId = process.env.ADMIN_ID;
const token = process.env.BOT_TOKEN;
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
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "You are a ai built on a large dataset of data and a human is speaking to you expecting that you say something as if you were a human too, here is what he says: "+input,
      temperature: 0.5,
      max_tokens: 4000
    });

    console.log(completion.data.choices)
    const answer = completion.data.choices[0].text;

    bot.sendMessage(adminChatId, answer);
  } catch(error) {
    // Might implement my own error handling logic here
    console.error(error);
  }

}