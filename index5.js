const TelegramBot = require('node-telegram-bot-api');
const rp = require('request-promise')  ;

// replace the value below with the Telegram token you receive from @BotFather
//const token = '371210908:AAGYdl0gP3FqqT0S3d3GeCuJtvGV4S8pXCg'; //test
const token = '364844293:AAGiF4suudJcd9Xc-K1gmFBQ4Kw8R8h27r8';// shugar
	const keyboard_0 = [
		['Прайс',
		'Выбор услуг',
		'Выбор дня'/*'Выбрать время'*/
		],
		['Записаться','Отказаться']
	];

	const keyboard = [
		['Усики','Предплечья','Подмышки'],
		['Полоска','Бикини','Бедра'],
		['Голень','Ноги',' '],
		['Отказаться','Назад']
	];
//БД в памяти 	
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const myCache2 = new NodeCache();
const myCache3 = new NodeCache();
const myCache4 = new NodeCache();//lдень и время
const myCache5 = new NodeCache();//день
const myCache6 = new NodeCache();//время
const myCache7 = new NodeCache();//флаг след.недели
//набор услуг обратный
myCache.set( 'Усики','У');
myCache.set( 'Предплечья','Р');
myCache.set( 'Подмышки','М');
myCache.set( 'Полоска','Ж');
myCache.set( 'Бикини','К');
myCache.set( 'Бедра','Б');
myCache.set( 'Голень','Г');
myCache.set( 'Ноги','Н');
//набор услуг
myCache2.set( 'У','Усики');
myCache2.set( 'Р','Предплечья');
myCache2.set( 'М','Подмышки');
myCache2.set( 'Ж','Полоска');
myCache2.set( 'К','Бикини');
myCache2.set( 'Б','Бедра');
myCache2.set( 'Г','Голень');
myCache2.set( 'Н','Ноги');
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
const week_days_2 = [
	['Пн:AM','Пн:PM','Вт:AM','Вт:PM'],
	['Ср:AM','Ср:PM','Чт:AM','Чт:PM'],
	['Пт:AM','Пт:PM','Сб:AM','Сб:PM'],
	['Вс:AM','Вс:PM',' ',' '],
	['Назад']
];
//дни недели
const week_days = [
	['Пн','Вт','Ср'],
	['Чт','Пт','Сб'],
	['Вс','Назад']
];
//часы приема
const day_hours = [
	['До обеда'],
	['После обеда']
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
/**/
});

// Matches "Выбор дня"
bot.onText(/Выбор дня/, (msg, match) => {
var options = {
    uri: 'https://script.google.com/macros/s/AKfycbx2k0kmZGPabdMgoeULgb4WKS6XjLQGWn6VCSOtrRqY1MjYtsk/exec',
    qs: {
      get_week_days:true
    },
    json: true
  };
 rp(options)
    .then(function (data) {
	var _ = require('lodash');
	data.days.push('След.неделя');
	data.days.push('Назад');
	var week_days_from_url = _.chunk(data.days,3);
	const chatId = msg.chat.id;
	myCache7.del( "chatId");
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
});
// Matches "След.неделя"
bot.onText(/След.неделя/, (msg, match) => {
var options = {
    uri: 'https://script.google.com/macros/s/AKfycbx2k0kmZGPabdMgoeULgb4WKS6XjLQGWn6VCSOtrRqY1MjYtsk/exec',
    qs: {
      get_week_days:true,
	  next_week:true
    },
    json: true
  };
// console.log(JSON.stringify(options)); 
 rp(options)
    .then(function (data) {
	var _ = require('lodash');
	data.days.push('Назад');
    //console.log(JSON.stringify(data)); 
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
/*	const chatId = msg.chat.id;
	//obj = { my: "Special", variable: 42 };
	myCache5.set( "chatId", match[1] );
//	define_order_status(msg,myCache,myCache4);
	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: day_hours
		})
	};
	bot.sendMessage(chatId,'Выберите время приема.', opts);
*/	
	myCache5.set( "chatId", match[1] );
	var qs = {
      get_hours:true,
	  day:match[1]
    };
	if (myCache7.get("chatId")){qs['next_week']=true;} //если есть накопленый признак след.неделя, то запрос делаем на след неделю
	var options = {
    uri: 'https://script.google.com/macros/s/AKfycbx2k0kmZGPabdMgoeULgb4WKS6XjLQGWn6VCSOtrRqY1MjYtsk/exec',
    qs: qs,
    json: true
  };
  
 rp(options)
    .then(function (data) {
	var _ = require('lodash');
	var array_hours=_.values(data)[0];
	array_hours.push('Назад');
	const hours_from_url = _.chunk(array_hours,3);
	const chatId = msg.chat.id;
	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: hours_from_url
		})
	};
	bot.sendMessage(chatId,'Выберите, с которого часа прием.', opts);

	  })
    .catch(function(err) {
      console.log(err);
    });	
});
// Matches время...
bot.onText(/(До обеда|После обеда)/, (msg, match) => {
	const chatId = msg.chat.id;
	myCache6.set( "chatId", match[1] );
	handleStart(msg, match) ;
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

// Matches "Отказаться или время"
// bot.onText(/Отказаться.*/, (msg, match) => {
	// const chatId = msg.chat.id;
	// //obj = { my: "Special", variable: 42 };
	// myCache.set( "chatId", '');
	// myCache4.set( "chatId", '');
	// define_order_status(msg,myCache,myCache4);
// });
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