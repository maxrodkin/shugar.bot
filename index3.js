const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather
const token = '371210908:AAGYdl0gP3FqqT0S3d3GeCuJtvGV4S8pXCg';
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const handleStart = (msg, match) => {
	const chatId = msg.chat.id;
	const data = 
	'username =@'+msg.chat.username+' '+
	'first_name = '+msg.chat.first_name+' '+
	'last_name = '+msg.chat.last_name+' '
	+'id = '+msg.from.id+' '
	;
	const message_id = bot.sendMessage('@InnoShugaringOrders', data);
	bot.sendMessage(chatId,data);
}

// Matches "/start"
bot.onText(/\/start/, handleStart);
// Matches "Назад" 
// нужно выполнить старт /start
bot.onText(/Назад/, handleStart);
