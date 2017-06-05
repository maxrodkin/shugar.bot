	const keyboard_0 = [
		['Прайс',
		'Выбрать услуги',
		'Выбрать время'
		],
		['Записаться']
	];

	const keyboard = [
		['Усики','Руки до локтя','Подмышки'],
		['Полоска на животике','Глубокое бикини','Бедра'],
		['Голень плюс колено','Ноги полностью','Очистить заказ'],
		['Назад']
	];
//БД в памяти 	
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const myCache2 = new NodeCache();
const myCache3 = new NodeCache();
const myCache4 = new NodeCache();
//набор услуг обратный
myCache.set( 'Усики','У');
myCache.set( 'Руки до локтя','Р');
myCache.set( 'Подмышки','М');
myCache.set( 'Полоска на животике','Ж');
myCache.set( 'Глубокое бикини','К');
myCache.set( 'Бедра','Б');
myCache.set( 'Голень плюс колено','Г');
myCache.set( 'Ноги полностью','Н');
//набор услуг
myCache2.set( 'У','Усики');
myCache2.set( 'Р','Руки до локтя');
myCache2.set( 'М','Подмышки');
myCache2.set( 'Ж','Полоска на животике');
myCache2.set( 'К','Глубокое бикини');
myCache2.set( 'Б','Бедра');
myCache2.set( 'Г','Голень плюс колено');
myCache2.set( 'Н','Ноги полностью');
//набор цен
myCache3.set( 'У',200);
myCache3.set( 'Р',400);
myCache3.set( 'М',200);
myCache3.set( 'Ж',150);
myCache3.set( 'К',600);
myCache3.set( 'Б',400);
myCache3.set( 'Г',500);
myCache3.set( 'Н',800);
//дни недели
const week_days = [
	['Пн:AM','Пн:PM','Вт:AM','Вт:PM'],
	['Ср:AM','Ср:PM','Чт:AM','Чт:PM'],
	['Пт:AM','Пт:PM','Сб:AM','Сб:PM'],
	['Вс:AM','Вс:PM',' ',' '],
	['Назад']
];
//сеансы приема
myCache4.set( 'Пн:AM','Понедельник до обеда');
myCache4.set( 'Вт:AM','Вторник до обеда');
myCache4.set( 'Ср:AM','Среда до обеда');
myCache4.set( 'Чт:AM','Четверг до обеда');
myCache4.set( 'Пт:AM','Пятница до обеда');
myCache4.set( 'Сб:AM','Суббота до обеда');
myCache4.set( 'Вс:AM','Воскресенье до обеда');
myCache4.set( 'Пн:PM','Понедельник после обеда');
myCache4.set( 'Вт:PM','Вторник после обеда');
myCache4.set( 'Ср:PM','Среда после обеда');
myCache4.set( 'Чт:PM','Четверг после обеда');
myCache4.set( 'Пт:PM','Пятница после обеда');
myCache4.set( 'Сб:PM','Суббота после обеда');
myCache4.set( 'Вс:PM','Воскресенье после обеда');
//'','','',''],
/*
	['ПнПн:AM','Вт'],
	['Ср',	'Чт'],
	['Пт',	'Сб'],
	['Вс','Назад']
		*/

const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = '387275580:AAGHewunWMt0yIzCzh52YJX4nsiMumGmtSE';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// // Matches "/echo [whatever]"
// bot.onText(/\/echo (.+)/, (msg, match) => {
  // // 'msg' is the received Message from Telegram
  // // 'match' is the result of executing the regexp above on the text content
  // // of the message

  // const chatId = msg.chat.id;
  // const resp = match[1]; // the captured "whatever"

  // // send back the matched "whatever" to the chat
  // bot.sendMessage(chatId, resp);
// });

// Matches "Записаться"
//https://t.me/InnoShugaringOrders
bot.onText(/Записаться/, (msg, match) => {
	const chatId = msg.chat.id;
	//const price_img = new inputMediaUploadedPhoto('C:\Users\admin\Pictures\pricelist.jpg');
	//  bot.sendPhoto(chatId, 'https://drive.google.com/open?id=0B8qRomgBHgAqVXF5ZTliQUZGeWs');
	const message_id = bot.sendMessage('@InnoShugaringOrders', '@'+msg.chat.username+' '+define_order_status(msg,myCache,myCache4));
	eraseOrder()(msg, match);
	bot.sendMessage(chatId,'Заявка отправлена администратору. С Вами свяжется администратор, пожалуйста ожидайте.😊');
	
	//console.log('message_id',message_id);
	//console.log('username',msg.chat.username);
	
});

// Matches "/price"
//bot.onText(/(\/price|Прайс)/, (msg, match) => {
bot.onText(/Прайс/, (msg, match) => {
	const chatId = msg.chat.id;
	//const price_img = new inputMediaUploadedPhoto('C:\Users\admin\Pictures\pricelist.jpg');
	//  bot.sendPhoto(chatId, 'https://drive.google.com/open?id=0B8qRomgBHgAqVXF5ZTliQUZGeWs');
	bot.sendSticker(chatId, 'CAADAgADBAADWDTYD1xroz36pUNeAg');
});

const handleStart = (msg, match) => {
	const chatId = msg.chat.id;
	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: keyboard_0
		})
	};
	define_order_status(msg,myCache,myCache4,null);	
	bot.sendMessage(chatId,'Ознакомьтесь с Прайсом, затем выберите услуги, выберите время и Запишитесь на прием.😊', opts);
}

const eraseOrder = (shouldCall) => (msg, match) => {
	const chatId = msg.chat.id;
	myCache.del( "chatId");
	myCache4.del( "chatId");
	shouldCall && define_order_status(msg,myCache,myCache4,null);
}

// Matches "/start"
bot.onText(/\/start/, handleStart);
// Matches "Назад" 
// нужно выполнить старт /start
bot.onText(/Назад/, handleStart);

// Matches "/order"
//bot.onText(/(\/order|Выбрать услуги)/, (msg, match) => {
bot.onText(/Выбрать услуги/, (msg, match) => {
	const chatId = msg.chat.id;

	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: keyboard
		})
	};
	define_order_status(msg,myCache,myCache4, opts);	
	bot.sendMessage(chatId,'Выберите услугу для добавления в заказ', opts);

});

// Matches "Выбрать время"
bot.onText(/Выбрать время/, (msg, match) => {
	const chatId = msg.chat.id;

	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: week_days
		})
	};
	bot.sendMessage(chatId,'Выберите день и время (до обеда = AM, после обеда = PM) приема. После выбора времени вернитесь назад в основное меню и нажмите Записаться. Заказ будет отправлен администратору:', opts);
});

// Matches день и время...
bot.onText(/(..:.M)/, (msg, match) => {
	const chatId = msg.chat.id;
	//obj = { my: "Special", variable: 42 };
	myCache4.set( "chatId", myCache4.get(match[1]) );
	define_order_status(msg,myCache,myCache4);
});

// Matches "Усики" и все услуги...
bot.onText(/(Усики|Руки до локтя|Подмышки|Полоска на животике|Глубокое бикини|Бедра|Голень плюс колено|Ноги полностью)/, (msg, match) => {
	const chatId = msg.chat.id;
	//obj = { my: "Special", variable: 42 };
	myCache.set( "chatId", myCache.get( "chatId" )+myCache.get(match[1]) );
	define_order_status(msg,myCache,myCache4);
	bot.sendMessage(chatId,'Выберите услугу.');
});

// Matches "Очистить заказ или время"
// bot.onText(/Очистить.*/, (msg, match) => {
	// const chatId = msg.chat.id;
	// //obj = { my: "Special", variable: 42 };
	// myCache.set( "chatId", '');
	// myCache4.set( "chatId", '');
	// define_order_status(msg,myCache,myCache4);
// });
bot.onText(/Очистить.*/, eraseOrder(true));

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
	// const chatId = msg.chat.id;
	// const order = myCache.get( "chatId" );
	// const order_status = (order== undefined) ? 'пуст.':'что-то есть.';
	// // send a message to the chat acknowledging receipt of their message
	// console.log( myCache.get( "chatId" ) );
	// bot.sendMessage(chatId, 'Выберите услугу. Сейчас Ваш заказ: '+order_status);
});

function define_order_status(msg,myCache,myCache4, opts){
	const chatId = msg.chat.id;
	const order = removeDuplicateCharacters(myCache.get( "chatId" ));
	const time = (typeof(myCache4.get( "chatId" )) === 'undefined')? 'неопределено':myCache4.get( "chatId" );
	const status = 'Сейчас Ваш заказ: '+getOrderText(order)+ ' на сумму '+getOrderSum(order)+' руб. Время приема '+time; 
	bot.sendMessage(chatId, status );
	return status;
}

function removeDuplicateCharacters(string){
try{
 return string
	.split('')
	.filter(function(item, pos, self) {
    return self.indexOf(item) == pos;
	})
.join('');
}
catch(err){
return string;
}
}

function getOrderText(str){
	const result = (str || '').split('')
		.map((charAtcount) => myCache2.get(charAtcount))
		.filter((value) => !!value)
		.join(', ')
//	console.log('RESULT', result)
	return result
}

function getOrderSum(str){
	const result = (str || '').split('')
		.map((charAtcount) => myCache3.get(charAtcount))
		.filter((value) => !!value)
		.reduce(function(sum, price){return sum+price},0);
//	console.log('SUM', result)
	return result
}