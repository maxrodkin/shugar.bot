const TelegramBot = require('node-telegram-bot-api');
const rp = require('request-promise')  ;
const google_calendar_request = require('./google_calendar_request');
const _ = require('lodash');
const NodeCache = require( "node-cache" );
//запрашиваем расписание из гуглкалендаря или из гуглтаблиц
var request_schedule_from_google_calendar = true;

// replace the value below with the Telegram token you receive from @BotFather 
const token = process.argv[2];
	const keyboard_0 = [
		['Прайс',
		'Выбор услуг',
		'Выбор дня'/*'Выбрать время'*/
		],
		['Записаться','Отказаться']
	];

	const keyboard = [];
//БД в памяти 	

const myCache = new NodeCache();
const myCache2 = new NodeCache();
const myCache3 = new NodeCache();
const myCache4 = new NodeCache();//lдень и время
const myCache5 = new NodeCache();//день
const myCache6 = new NodeCache();//время
const myCache7 = new NodeCache();//флаг след.недели

//дни недели
const week_days_2 = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.onText(/Записаться/, (msg, match) => {
	const chatId = msg.chat.id;
	//const price_img = new inputMediaUploadedPhoto('C:\Users\admin\Pictures\pricelist.jpg');
	//  bot.sendPhoto(chatId, 'https://drive.google.com/open?id=0B8qRomgBHgAqVXF5ZTliQUZGeWs');
	const data = 
	'@'+msg.chat.username+' '+
	'ФИО = '+msg.chat.first_name+' '+' '+msg.chat.last_name
	+' id = '+msg.from.id+' '
	;	
	const order_status = define_order_status(msg,myCache,myCache4);
	const zero_sum = (order_status.indexOf('на сумму 0') > 0)? true: false;
	const zero_time = (order_status.indexOf('Время приема неопределено') > 0)? true: false;
	if (zero_sum) {bot.sendMessage(chatId,'Вы не выбрали ни одной услуги. Пока не могу принять заявку. Нажмите кнопку Выбор услуг.😊');} 
	if (zero_time) {bot.sendMessage(chatId,'Вы не выбрали день и время приема. Пока не могу принять заявку. Нажмите кнопку Выбор дня.😊');} 
	if (!zero_time&&!zero_sum) { 
		const message_id = bot.sendMessage('@InnoShugaringOrders', data+' '+order_status);
		eraseOrder()(msg, match);
		bot.sendMessage(chatId,'Заявка отправлена администратору. С Вами свяжется администратор, пожалуйста ожидайте.😊');
	}
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
	myCache4.del( "chatId");
	myCache5.del( "chatId");
	myCache6.del( "chatId");
	myCache7.del( "chatId");
	shouldCall && define_order_status(msg,myCache,myCache4,null);
}

// Matches "/start"
bot.onText(/\/start/, handleStart);
// Matches "Назад" 
// нужно выполнить старт /start
bot.onText(/Назад/, handleStart);

// Matches "/order"
//bot.onText(/(\/order|Выбор услуг)/, (msg, match) => {
bot.onText(/Выбор услуг/, (msg, match) => {
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

function bot_onText_Request_to_google_calendar(params,AdditionalButtons){  //делаем rest запрос в гуглкалендарь
	if (params.next_week){myCache7.set( "chatId", true );} else {myCache7.del( "chatId");}//запоминаем признак следующей недели
	google_calendar_request.request({next_week:params.next_week,get_hours:params.get_hours,day:params.day},function(week_days_or_hours_from_url){
		if (AdditionalButtons){for(var i=0; i<AdditionalButtons.length;i++){week_days_or_hours_from_url.push(AdditionalButtons[i]);}}
		week_days_or_hours_from_url.push('Назад');
		var week_days_or_hours_from_url = _.chunk(week_days_or_hours_from_url,3); //разбиваем массив на тетрады для удобства отображения в виде кнопок бота
		//console.log('week_days_or_hours_from_url',week_days_or_hours_from_url);
		const chatId = params.msg.chat.id;
		var opts = {
			reply_to_message_id: params.msg.message_id,
			reply_markup: JSON.stringify({
			keyboard: week_days_or_hours_from_url
			})
		};
		bot.sendMessage(chatId,'Выберите день приема, затем время. После  этого вернитесь назад в основное меню и нажмите Записаться. Заказ будет отправлен администратору:', opts);
	});/**/
}
// Matches "Выбор дня"
bot.onText(/Выбор дня/, (msg, match) => {
if (request_schedule_from_google_calendar) {bot_onText_Request_to_google_calendar({msg:msg,next_week:false},['След.неделя']);}
else {bot_onText_Request_to_google_sheet(msg,['След.неделя']);}  //делаем rest запрос к скрипту гуглтаблицы	//deprecared: подлежит замене на запрос в гуглкалендарь}
});


// Matches "След.неделя"
bot.onText(/След.неделя/, (msg, match) => {
/*var options = {
    uri: 'https://script.google.com/macros/s/AKfycbx2k0kmZGPabdMgoeULgb4WKS6XjLQGWn6VCSOtrRqY1MjYtsk/exec',
    qs: {
      get_week_days:true,
	  next_week:true
    },
    json: true
  };
 rp(options)
    .then(function (data) {
	var _ = require('lodash');
	data.days.push('Назад');
	var week_days_from_url = _.chunk(data.days,3);
	const chatId = msg.chat.id;
	myCache7.set( "chatId", true );
	var opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: week_days_from_url
		})
	};
	bot.sendMessage(chatId,'Выберите день приема, затем время. После  этого вернитесь назад в основное меню и нажмите Записаться. Заказ будет отправлен администратору:', opts);

	  })
    .catch(function(err) {
      console.log(err);
    });
*/
if (request_schedule_from_google_calendar) {bot_onText_Request_to_google_calendar({msg:msg,next_week:true});}
else {bot_onText_Request_to_google_sheet(msg);}  //делаем rest запрос к скрипту гуглтаблицы	//deprecared: подлежит замене на запрос в гуглкалендарь}

});


// Matches день и время...
bot.onText(/(..:.M)/, (msg, match) => {
	const chatId = msg.chat.id;
	//obj = { my: "Special", variable: 42 };
	myCache4.set( "chatId", myCache4.get(match[1]) );
	define_order_status(msg,myCache,myCache4);
});
// Matches день ...
bot.onText(/(Пн|Вт|Ср|Чт|Пт|Сб|Вс)/, (msg, match) => {
	myCache5.set( "chatId", match[1] );
	bot_onText_Request_to_google_calendar({msg:msg,next_week:((myCache7.get("chatId"))?true:false),get_hours:true,day:match[1]});
});

// Matches время...
bot.onText(/(\d{1,2})/, (msg, match) => {
	const chatId = msg.chat.id;
	myCache6.set( "chatId", match[1] );
	handleStart(msg, match) ;
});
// Matches "Усики" и все услуги...
bot.onText(/(Усики|Предплечья|Подмышки|Полоска|Бикини|Бедра|Голень|Ноги)/, (msg, match) => {
	const chatId = msg.chat.id;
	//obj = { my: "Special", variable: 42 };
	myCache.set( "chatId", myCache.get( "chatId" )+myCache.get(match[1]) );
	define_order_status(msg,myCache,myCache4);
	bot.sendMessage(chatId,'Выберите услугу.');
});

bot.onText(/Отказаться.*/, eraseOrder(true));

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
//	const time = (typeof(myCache4.get( "chatId" )) === 'undefined')? 'неопределено':myCache4.get( "chatId" );
	const day = (typeof(myCache5.get( "chatId" )) === 'undefined')? 'неопределено':myCache5.get( "chatId" );
	const time = (typeof(myCache6.get( "chatId" )) === 'undefined')? 'неопределено':myCache6.get( "chatId" );
	const next_week = (myCache7.get( "chatId" ))? 'На следующей неделе':'На этой неделе';
	
	var day_time = next_week+' в '+day+' c '+time+':00';
	day_time = (day == 'неопределено' && time == 'неопределено')?'неопределено':day_time;
	
	const status = 'Сейчас Ваш заказ: '+getOrderText(order)+ ' на сумму '+getOrderSum(order)+' руб.'+' Время приема '+day_time; 
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
