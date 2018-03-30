const TelegramBot = require('node-telegram-bot-api');
const token = process.argv[2];
const bot = new TelegramBot(token, {polling: true});
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
		bot.sendMessage(msg.chat.id,'hello world');
});
