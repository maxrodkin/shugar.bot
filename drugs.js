const TelegramBot = require('node-telegram-bot-api');
const rp = require('request-promise')  ;
var price_items = [];
//var price_items_regex_string = 'abraca|dabra';
var price_items_regex =getRegex('abraca|dabra'); // new RegExp(price_items_regex_string, "giu");

function getRegex (regex_string){
	return new RegExp(regex_string, "giu");
}

// replace the value below with the Telegram token you receive from @BotFather
//const token = '371210908:AAGYdl0gP3FqqT0S3d3GeCuJtvGV4S8pXCg'; //тест бот @rodkin_test_bot
//const token = '418120660:AAGFcvlIok7YXDxe1F-C7LBloVm1SA908PQ'; //rodkin2bot
const token = '436341722:AAFeMw-S3PN1iJcyoEgs88mv3y_G0ecJXDU'; // Аптека в ЖК Инно @pharmacy_inno_bot
	const keyboard_0 = [
		['Выбрать','Отказаться']
		,['Заказать']
		,['Сдать на реализацию']
	];
	const keyboard_1 = [
		['Предложить','Отказаться']
	];

//БД в памяти 	
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
const myCache1 = new NodeCache();
const UserCurrentMenu_Cache = new NodeCache();
const UserItemsForSale_Cache = new NodeCache();
var data_price = null;
 
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

function send_message_to_group_chat(msg, match){
	const chatId = msg.chat.id;
	const data = 
	'@'+msg.chat.username+' '+
	'ФИО = '+msg.chat.first_name+' '+' '+msg.chat.last_name
	+' id = '+msg.from.id+' '
	;	
	const order_status = define_order_status(msg);
	const zero_sum = (order_status.indexOf('на сумму 0') > 0)? true: false;
	if (zero_sum) {bot.sendMessage(chatId,'Вы не выбрали ни одного товара. Пока не могу принять заявку. Нажмите кнопку Выбрать.😊');} 
	if (!zero_sum) { 
		const message_id = bot.sendMessage(/*'@InnoShugaringOrders'*/'@test_group_2', data+' '+order_status);
		eraseOrder()(msg, match);
	}
	//console.log('message_id',message_id);
	//console.log('username',msg.chat.username);	
}

// Matches "Сдать на реализацию"
bot.onText(/Сдать на реализацию/, (msg, match) => {
	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: keyboard_1
		})
	};	
	UserCurrentMenu_Cache.set(msg.chat.id,'Сдать на реализацию');
	bot.sendMessage(msg.chat.id,'Напишите мне (и отправьте!) название, упаковку, дозировку, срок годности (что знаете), цену товара. Как все отправите мне, нажмите Предложить или Отказаться.', opts);
});

// Matches "Заказать"
//https://t.me/InnoShugaringOrders
bot.onText(/Заказать|Предложить/, (msg, match) => {
	UserCurrentMenu_Cache.set(msg.chat.id,msg.text);//запоминаем последнюю команду = текущий пункт меню
	send_message_to_group_chat(msg, match);
	const words = {'Заказать':'Заявка отправлена','Предложить':'Предложение отправлено'};
	bot.sendMessage(msg.chat.id,words[match]+'. С Вами свяжется администратор, пожалуйста ожидайте.😊');
	eraseOrder(true);
	handleStart	(msg, match);
});

const handleStart = (msg, match) => {
	const chatId = msg.chat.id;
	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: keyboard_0
		})
	};
//	bot.sendMessage(chatId,define_order_status(msg)+'\n'+'Нажмите Выбрать для подбора товара. После выбора - Заказать или Отказаться.😊', opts);
	bot.sendMessage(chatId,'чтоб заказать лекарство - Выбрать, чтобы продать - Сдать... После этого - Заказать или Отказаться.😊', opts);
}

const eraseOrder = (shouldCall) => (msg, match) => {
	myCache.del( msg.chat.id);
	myCache1.del( msg.chat.id);
	UserItemsForSale_Cache.del(msg.chat.id);
	UserCurrentMenu_Cache.del(msg.chat.id);
	shouldCall && define_order_status(msg);
}

// Matches "/start"
bot.onText(/\/start/, handleStart);
// Matches "Назад" 
// нужно выполнить старт /start
bot.onText(/Назад/, handleStart);

bot.onText(/Отказаться/, (msg, match) => {
eraseOrder(true);
handleStart	(msg, match);
});


// Matches "Выбрать"
bot.onText(/Выбрать/, (msg, match) => {
	UserCurrentMenu_Cache.set(msg.chat.id,'Выбрать');
	const chatId = msg.chat.id;
	var options = {
		uri: 'https://script.google.com/macros/s/AKfycbzwAifJfudQlJ46Uz7r_LjkUIq2sRq4yF9yfbOefeFs86t0QA/exec',
		qs: {
		  get_price:true
		},
		json: true
	  };
//делаем rest запрос к скрипту гуглтаблицы	
 rp(options)
    .then(function (data) {
	var _ = require('lodash');
	const chatId = msg.chat.id;
	price_items = _.chunk(_.keys(data.price),1);
	data_price = data.price;
	//console.log(price_items);
	var price_items_regex_string = price_items.toString().replace(/,/g,'|');
	//console.log(price_items_regex_string);
	//price_items_regex  = new RegExp(price_items_regex_string, "giu");
	price_items_regex =getRegex(price_items_regex_string);
	price_items.unshift(['Назад']);
	var opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: price_items
		})
	};
	bot.sendMessage(chatId,'Выберите препарат, вернитесь назад в основное меню и нажмите Заказать. Заказ будет отправлен администратору:', opts);
/**/
});
});

// Matches все drugs...
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
//	UserCurrentMenu_Cache.set(msg.chat.id,msg.text);//запоминаем последнюю команду = текущий пункт меню
	if (UserCurrentMenu_Cache.get(msg.chat.id) == 'Сдать на реализацию')
		{
				const UserItemsForSale_Cache_current = (typeof(UserItemsForSale_Cache.get(msg.chat.id )) === 'undefined')? '':UserItemsForSale_Cache.get(msg.chat.id )+'\n';
				UserItemsForSale_Cache.set(msg.chat.id,UserItemsForSale_Cache_current+msg.text);
		}
		{
			//console.log('Ищем строку=', msg.text);
			//console.log('Regexp = ',price_items_regex);
			//если покупаем
			if (UserCurrentMenu_Cache.get(msg.chat.id)=='Выбрать' && price_items_regex.exec(msg.text)){ 
			//console.log('Нашли строку!');
			myCache.set( 
			msg.chat.id, 
			((typeof(myCache.get( msg.chat.id ))=== 'undefined' )?'':myCache.get( msg.chat.id )+", ")
			+ msg.text
			);
			myCache1.set(msg.chat.id, ((myCache1.get( msg.chat.id )>0)?myCache1.get( msg.chat.id ):0) + data_price[msg.text]);
		//console.log(msg.text, data_price[msg.text],(myCache1.get( msg.chat.id )));
			bot.sendMessage(msg.chat.id,'Выберите еще товар или нажмите Назад и Заказать. '+define_order_status(msg));
			}
			//если продаем
			if (UserCurrentMenu_Cache.get(msg.chat.id)=='Сдать на реализацию'){ 
			bot.sendMessage(msg.chat.id,'Напишите и отправьте еще товар или нажмите Предложить или Отказаться. '+define_order_status(msg));
			}	
		}
});




function define_order_status(msg, opts){
	var status = null;
	//console.log(UserCurrentMenu_Cache.get(msg.chat.id));
	if (UserCurrentMenu_Cache.get(msg.chat.id)=='Выбрать'||UserCurrentMenu_Cache.get(msg.chat.id)=='Заказать'){
		status = 'Сейчас Ваш заказ: '+	((typeof(myCache.get( msg.chat.id ))=== 'undefined' )?'пуст.':myCache.get( msg.chat.id )+ ' на сумму '+getOrderSum( msg.chat.id )+' руб.'); }
	if (UserCurrentMenu_Cache.get(msg.chat.id)=='Предложить'||UserCurrentMenu_Cache.get(msg.chat.id)=='Сдать на реализацию'){
		status = 'Сейчас Ваше предложение: '+'\n'+	UserItemsForSale_Cache.get(msg.chat.id); }
	return status;
}

function getOrderSum(msg_chat_id){
	return myCache1.get( msg_chat_id )
}