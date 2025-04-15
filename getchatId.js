const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.on("message", (msg) => {
    console.log("Chat ID:", msg.chat.id);
});
