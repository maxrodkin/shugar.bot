const TelegramBot = require('node-telegram-bot-api');
const rp = require('request-promise')  ;
const moment = require('moment');
var price_index = [];
var price_items = [];
var price_index_0 = [];
var price_index_regex_string = '';//'abraca|dabra';
var _ = require('lodash');
	//var price_items_regex =getRegex('abraca|dabra'); // new RegExp(price_index_regex_string, "giu");

function getRegex (regex_string){
	return new RegExp(regex_string, "giu");
}

// replace the value below with the Telegram token you receive from @BotFather
//const token = '371210908:AAGYdl0gP3FqqT0S3d3GeCuJtvGV4S8pXCg'; //тест бот @rodkin_test_bot
//const token = '418120660:AAGFcvlIok7YXDxe1F-C7LBloVm1SA908PQ'; //rodkin2bot
const token = '436341722:AAFeMw-S3PN1iJcyoEgs88mv3y_G0ecJXDU'; // Аптека в ЖК Инно @pharmacy_inno_bot
const keyboard_0 = [//топ меню
	['Купить']
	,['Сдать на реализацию']
];
const keyboard_1 = [//сдать на реализацию
	['Предложить','Отказаться']
];
const keyboard_2 = 	['Ок, беру!','Отказаться']//купить
;
const keyboard_4 = 	['Назад']
;
const keyboard_3 = 	['Алфавитный указатель','За 0 рублей!!'/*,'Поиск'*/,'Полный список'].concat(keyboard_4)//алфавитный индекс
;



//const all_keyboard = ["/start"].concat(keyboard_0).concat(keyboard_1).concat(keyboard_2).concat(keyboard_3).concat(keyboard_4);
//const all_keyboard = (["/start"].concat(keyboard_0,keyboard_1,keyboard_2,keyboard_3,keyboard_4)).toString();

const all_keyboard = ["/start"].concat(keyboard_0[0],keyboard_0[1],keyboard_1[0],keyboard_1[1],keyboard_2,keyboard_3,keyboard_4);
 
//БД в памяти 	
const NodeCache = require( "node-cache" );
var myCache = new NodeCache();
var myCache1 = new NodeCache();
var UserCurrentMenu_Cache = new NodeCache();
var UserItemsForSale_Cache = new NodeCache();
var CommandStack_Cache = new NodeCache();
var price_items = null;
var price_items0 = null;
 
// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

function send_message_to_group_chat(msg, match){
	const chatId = msg.chat.id;
	const data0 = 
	'@'+msg.chat.username+' '+
	'ФИО = '+msg.chat.first_name+' '+' '+msg.chat.last_name
	+' id = '+msg.from.id+' '
	;	
	const order_status = define_order_status(msg.chat.id);
	const zero_status = (order_status.indexOf('пуст') > 0)? true: false;
	if (zero_status) {bot.sendMessage(chatId,'Вы не выбрали ни одного лекарства. Пока не могу принять заявку. Продолжите выбор.😊');} 
	if (!zero_status) { 
		const message_id = bot.sendMessage(/*'@InnoShugaringOrders'*/'@test_group_2', data0+' '+order_status);
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
	bot.sendMessage(msg.chat.id,'Напишите мне (И ОТПРАВЬТЕ, НАЖАВ Enter!) название, упаковку, дозировку, срок годности (что знаете), цену лекарства. Как все отправите мне, нажмите Предложить или Отказаться.', opts);
});

// Matches "Ок, беру!"
//https://t.me/InnoShugaringOrders
bot.onText(/Ок, беру!|Предложить/, (msg, match) => {
	//UserCurrentMenu_Cache.set(msg.chat.id,msg.text);//запоминаем последнюю команду = текущий пункт меню
	send_message_to_group_chat(msg, match);
	const words = {'Ок, беру!':'Заявка отправлена','Предложить':'Предложение отправлено'};
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
	bot.sendMessage(chatId,'Вы можете купить или сдать лекарство 😊'+'\n'+define_order_status(msg.chat.id), opts);
//	bot.sendMessage(chatId,'Вы можете купить или сдать лекарство 😊', opts);
}

function eraseOrder_function(msg_chat_id){
	myCache.del( msg_chat_id);
	myCache1.del( msg_chat_id);
	UserItemsForSale_Cache.del(msg_chat_id);
	UserCurrentMenu_Cache.del(msg_chat_id);
	//console.log(myCache);	
}

const eraseOrder = (shouldCall) => (msg, match) => {
	eraseOrder_function(msg.chat.id);
	shouldCall && define_order_status(msg.chat.id);
	handleStart	(msg, match);
}

// Matches "/start"
bot.onText(/\/start/, handleStart);
// Matches "Назад" 
// нужно выполнить старт /start
bot.onText(/Назад/, (msg, match) => {
	//console.log('Нажал Назад');
	var command = pullCommandFromHistory(msg);
	//console.log('command = ',command);
	if(command == 'Алфавитный указатель') {function_1(msg, match)}
	else if(command == 'Купить') {function_2(msg, match)}
	else if(typeof(command) === 'undefined') {handleStart(msg, match)}
	else {handleStart(msg, match)}
});

bot.onText(/Отказаться/, eraseOrder(true));

function function_1(msg, match){//Алфавитный указатель/
	UserCurrentMenu_Cache.set(msg.chat.id,'Купить');
	const chatId = msg.chat.id;
	var options = {
		uri: 'https://script.google.com/macros/s/AKfycbzwAifJfudQlJ46Uz7r_LjkUIq2sRq4yF9yfbOefeFs86t0QA/exec',
		qs: {
		  action:'get_index2'
		},
		json: true
	  };
//делаем rest запрос к скрипту гуглтаблицы	
 rp(options)
    .then(function (data) {
	var _ = require('lodash');
	const chatId = msg.chat.id;
	index_items = _.chunk(data.index.split(""),5);
	index_items.unshift(keyboard_4);
	var opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: index_items
		})
	};
	bot.sendMessage(chatId,'Выберите лекарство или подтвердите сделку. Заказ будет отправлен администратору:', opts);
/**/
});
}

bot.onText(/Алфавитный указатель/, (msg, match) => {
function_1(msg, match);
});

function function_2(msg, match,_action){//Купить
//console.log('мы в Купить');
	const chatId = msg.chat.id;
	
//делаем rest запрос к скрипту гуглтаблицы	
	var options = {
		uri: 'https://script.google.com/macros/s/AKfycbzwAifJfudQlJ46Uz7r_LjkUIq2sRq4yF9yfbOefeFs86t0QA/exec',
		qs: {
		  action:_action//'get_price2'
		},
		json: true
	  };
	rp(options)
		.then(function (data) {
			//price_index = _.chunk(_.keys(data.price),1);
			price_items = data.price;
			price_items = _.map(price_items,function(item){item.item_price = item.item+' '+item.price+' р.'; return item});
			get_items_buttons_from_price_items();
			const opts = {
			reply_to_message_id: msg.message_id,
			reply_markup: JSON.stringify({
			keyboard: _.chunk(keyboard_3,1)
			})
		};
		bot.sendMessage(chatId,'Выберите лекарство одним из способов 😊', opts);
	});	
}

bot.onText(/Купить/, (msg, match) => {
function_2(msg, match,'get_price2');
//function_2(msg, match,'get_price0');
});

function get_items_buttons_from_price_items(){
//	price_index = _.chunk(_.keys(price_items),1);
	var price_items_array = Object.keys(price_items).map(function(key) {return [price_items[key]];});
	//console.log('price_items_array',price_items_array);
	price_index_0 = price_items_array.map(function(obj){return obj[0].item}); 
	price_index = _.chunk(price_index_0,1);
	//console.log('price_index',price_index);
	price_index_regex_string = price_index.toString().replace(/,/g,'|');
	//console.log(price_index_regex_string);
}


bot.onText(/Полный список/, (msg, match) => {
	UserCurrentMenu_Cache.set(msg.chat.id,'Купить');
	var price_items_items = _.map(price_items,function(price_item){return price_item;})  	
	sendKeyboard2(msg,price_items_items);
/*	get_items_buttons_from_price_items();
	price_index.unshift((keyboard_2.concat(keyboard_4)));	
	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: price_index
		})
	};
	bot.sendMessage(msg.chat.id,'Выберите лекарство или подтвердите сделку. Заказ будет отправлен администратору:', opts);*/
//});
});

bot.onText(/За 0 рублей!!/, (msg, match) => {
	UserCurrentMenu_Cache.set(msg.chat.id,'Купить');
	var price_items_items1 = _.map(price_items,function(price_item){return price_item;})  	
	var price_items_items = _.filter(price_items_items1,function(price_item){return price_item.price<=0;})  	
	sendKeyboard2(msg,price_items_items);
});

function sendKeyboard2(msg,_array) {
	const array1= _array.map(function(item){return item.item+' '+item.price+' р.'});
	const buttons = _.chunk(array1,1);
	buttons.unshift((keyboard_2.concat(keyboard_4)));
	const opts = {
		reply_to_message_id: msg.message_id,
		reply_markup: JSON.stringify({
		keyboard: buttons
		})
	};
	bot.sendMessage(msg.chat.id,'Выберите лекарство или подтвердите сделку. Заказ будет отправлен администратору:', opts);
//});
}

function add_remove_good_in_basket(msg_chat_id, price_item , action){
	if (action == '+'){
		myCache.set( 
		msg_chat_id, 
		((typeof(myCache.get( msg_chat_id ))=== 'undefined' )?'':myCache.get( msg_chat_id )+", ")
		+ price_item
		);
		var item = _.find(price_items,function(obj){return obj.item==price_item});
		var price = item.price;
		myCache1.set(msg_chat_id, ((myCache1.get( msg_chat_id )>0)?myCache1.get( msg_chat_id ):0) + price);
	}
	else if (action == '-'){
		myCache.set( 
		msg_chat_id, 
		((typeof(myCache.get( msg_chat_id ))=== 'undefined' )?'':myCache.get( msg_chat_id ).replace(price_item,'')));
		var item = _.find(price_items,function(obj){return obj.item==price_item});
		var price = item.price;
		myCache1.set(msg_chat_id, ((myCache1.get( msg_chat_id )>0)?myCache1.get( msg_chat_id ):0) - price);
		
	}
	if (myCache.get( msg_chat_id ).replace(' ','').replace(',','')==""){
		eraseOrder_function(msg_chat_id);
		}
	
}

function all_msg_listener(msg){
	//тут перехватываем все сообщения, т.к. кнопки кроме определенных команд могут содержать названия лекарств. обработку команд пропускаем дальше, лекарства заносим в корзину  
		//console.log(msg.text);
		//console.log(all_keyboard.toString());
		//console.log(all_keyboard.indexOf(msg.text));
	if (all_keyboard.indexOf(msg.text)==-1){//если это не команда
		if (UserCurrentMenu_Cache.get(msg.chat.id) == 'Сдать на реализацию')
			{
				var UserItemsForSale_Cache_current = (typeof(UserItemsForSale_Cache.get(msg.chat.id )) === 'undefined')? '':UserItemsForSale_Cache.get(msg.chat.id )+'\n';
				UserItemsForSale_Cache.set(msg.chat.id,UserItemsForSale_Cache_current+msg.text);
				bot.sendMessage(msg.chat.id,'Напишите и отправьте еще лекарство или нажмите Предложить или Отказаться. '+define_order_status(msg.chat.id));
			}
		else if (UserCurrentMenu_Cache.get(msg.chat.id) == 'Купить')//если мы в ветке Купить
			{
				if (msg.text.length == 1) { //одна буква - значит мы в алфавитном указателе
//				var price_items_keys = price_index_0;      //получаем массив из названий препаратов и цены чз пробел
//				var price_items_items_prices = _.map(price_items,function(obj){return obj.item});
				var price_items_filtered_by_first_letter = _.filter(price_items,function(price_item){return price_item.item.substr(0,1) == msg.text;}) // фильтруем все товары , начинающеся с буквы 	
				sendKeyboard2(msg,price_items_filtered_by_first_letter);
				pushCommandToHistory(msg);
				}
				else{ //многа букав - значит мы нажали кнопку с лекарством
					const price_items_regex =getRegex(price_index_regex_string);
					//console.log('Ищем строку=', msg.text);
					//console.log('Regexp = ',price_items_regex);
					//если покупаем
					if (price_items_regex.exec(msg.text)){  //ищем название нажатой кнтопки в списке лекарств. если нажали кнопку с лекарством
						//console.log('Нашли строку!');
						//старый вариант, когда кнопка с лекарством делает заказ
						/*
						myCache.set( 
						msg.chat.id, 
						((typeof(myCache.get( msg.chat.id ))=== 'undefined' )?'':myCache.get( msg.chat.id )+", ")
						+ msg.text
						);
						myCache1.set(msg.chat.id, ((myCache1.get( msg.chat.id )>0)?myCache1.get( msg.chat.id ):0) + price_items[msg.text]);
						*/
						//новый вариант, когда кнопка с лекарством выдает описание и inline keyboard
//						var expiration = price_items[msg.text].expiration;
						var item = _.find(price_items,function(obj){return obj.item_price==msg.text});
						var expiration = item.expiration;
						var expired = (new Date(expiration) - Date.now()<0)?true:false;
						var expiration_text = (expired)?' ПРОСРОЧЕН! Этот препарат может быть только отдан бесплатно, его использование на Вашу ответвенность!':'';
						var price = (expired)?0:item.price;
						var code = item.code;
						// инлайн кнопки + и - для заказа
						var keyboardStr = JSON.stringify({
						  inline_keyboard: [
							[
							  {text:'+',callback_data:JSON.stringify({'chat_id':msg.chat.id,'code':code,'action':'+'})},
							  {text:'-',callback_data:JSON.stringify({'chat_id':msg.chat.id,'code':code,'action':'-'})}
							]
						  ]
						});

						var keyboard = {reply_markup: JSON.parse(keyboardStr)};						
						
						bot.sendMessage(msg.chat.id, 
						'ПРЕПАРАТ:'+'\n'
						+item.item+'\n'
						+'Цена: '+price+' р.'+'\n'
						+'Срок годности: '+moment(expiration).format('DD/MM/YYYY')+expiration_text+'\n'
						+'Примечание: '+item.note+'\n'
						+'Добавьте или удалите препарат для заказа кнопками + и - :'+'\n'
						,keyboard);
					}
					bot.sendMessage(msg.chat.id,'Выберите лекарство или подтвердите сделку или откажитесь. '+define_order_status(msg.chat.id));
				}
			}
	}
	else if (msg.text.length == 1) { //одна буква - значит мы в алфавитном указателе
		var price_items_keys = _.keys(price_items);
		var price_items_filtered_by_first_letter = price_items_keys.filter(function(price_item){return price_item.substr(0,1) == msg.text;}) // фильтруем все товары , начинающеся с буквы 	
		//console.log(price_items_keys);
		//console.log(price_items_filtered_by_first_letter);
		sendKeyboard2(msg,price_items_filtered_by_first_letter);
		//CommandStack_Cache.set(msg.chat.id, (!Array.isArray(CommandStack_Cache.get(msg.chat.id)))?[]:CommandStack_Cache.get(msg.chat.id).push(msg.text));//если это команда, то пишем команду в стек команд
		pushCommandToHistory(msg);
	}
	else if (msg.text == 'Назад') {
		
	}
	else{//если это команда
//		console.log(typeof(CommandStack_Cache.get(msg.chat.id)));
//		CommandStack_Cache.set(msg.chat.id, (typeof(CommandStack_Cache.get(msg.chat.id))=== 'undefined')?[]:CommandStack_Cache.get(msg.chat.id).push(msg.text));//если это команда, то пишем команду в стек команд
//		CommandStack_Cache.set(msg.chat.id, (!Array.isArray(CommandStack_Cache.get(msg.chat.id)))?[]:CommandStack_Cache.get(msg.chat.id).push(msg.text));//если это команда, то пишем команду в стек команд
//		console.log(CommandStack_Cache.get(msg.chat.id));
		pushCommandToHistory(msg);
	}
//	console.log(CommandStack_Cache.get(msg.chat.id));		
}
// Matches все drugs...
// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
all_msg_listener(msg);
});

//перехватываем вызов инлайн кнопок
bot.on('callback_query', function (msg) {
	data_from_button = JSON.parse(msg.data);
	var response = '';
	var item = _.find(price_items,function(obj){return obj.code == data_from_button.code}).item ;
	if (data_from_button.action=='+'){response = 'Препарат '+item+' добавлен в корзину заказа.'}
	else if (data_from_button.action=='-'){response = 'Препарат '+item+' удален из корзины заказа.'}
	add_remove_good_in_basket(data_from_button.chat_id,item, data_from_button.action);
	bot.answerCallbackQuery(msg.id, response, false);
	bot.sendMessage(data_from_button.chat_id,define_order_status(data_from_button.chat_id));
});

function pushCommandToHistory(msg){
		if (Array.isArray(CommandStack_Cache.get(msg.chat.id))){
		var arr = CommandStack_Cache.get(msg.chat.id);
		arr.push(msg.text);
		CommandStack_Cache.set(msg.chat.id,arr);
		}
		else{CommandStack_Cache.set(msg.chat.id,[]);}
//console.log(CommandStack_Cache.get(msg.chat.id));	
}
function pullCommandFromHistory(msg){
		if (Array.isArray(CommandStack_Cache.get(msg.chat.id))){
		var arr = CommandStack_Cache.get(msg.chat.id);
		arr.splice(-1,1);
		var res = arr[arr.length-1];
		CommandStack_Cache.set(msg.chat.id,arr);
		return res;
		}
		else{return null;}
//console.log(CommandStack_Cache.get(msg.chat.id));	
}

function define_order_status(msg_chat_id, opts){
	var status = null;
	//console.log(UserCurrentMenu_Cache.get(msg.chat.id));
	if (UserCurrentMenu_Cache.get(msg_chat_id)=='Купить'||UserCurrentMenu_Cache.get(msg_chat_id)=='Ок, беру!'){
		status = 'Сейчас Ваш заказ: '+	((typeof(myCache.get( msg_chat_id ))=== 'undefined' )?'пуст.':myCache.get( msg_chat_id )+ ' на сумму '+getOrderSum( msg_chat_id )+' руб.'); }
	else if (UserCurrentMenu_Cache.get(msg_chat_id)=='Предложить'||UserCurrentMenu_Cache.get(msg_chat_id)=='Сдать на реализацию'){
//		console.log(typeof(UserItemsForSale_Cache.get(msg_chat_id)));
//		status = 'Сейчас Ваше предложение: '+'\n'+	(typeof(UserItemsForSale_Cache.get(msg_chat_id))=== 'undefined' )?'пусто.':UserItemsForSale_Cache.get(msg_chat_id); }
		status = 'Сейчас Ваше предложение: '+'\n'+	UserItemsForSale_Cache.get(msg_chat_id); }
	else{
		status = 'Сейчас Ваша корзина пуста.';}
	return status;
}

function getOrderSum(msg_chat_id){
	return myCache1.get( msg_chat_id )
}