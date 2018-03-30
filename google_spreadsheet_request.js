
//делаем rest запрос к скрипту гуглтаблицы	//deprecared: подлежит замене на запрос в гуглкалендарь
function bot_onText_Request_to_google_sheet(msg,AdditionalButtons){
	var options = {
		uri: 'https://script.google.com/macros/s/AKfycbx2k0kmZGPabdMgoeULgb4WKS6XjLQGWn6VCSOtrRqY1MjYtsk/exec',
		qs: {
		  get_week_days:true
		},
		json: true
	};
	rp(options)
	.then(function (data) {
		//в data json объект со свободными днями недели	
		//deprecared: подлежит замене на запрос в гуглкалендарь	
		var _ = require('lodash');
		var n = new Date().getDay(); //eturns the day of the week (from 0 to 6) for the specified date. Sunday is 0, Monday is 1, and so on
		if (n==0){n=7}; // номер дня недели. переводим из формата недели США, когда Вс = 0 день, в РФ , когда Вс = 7 день
		const current_week_day= week_days_2 [n-1]; //текущий день в неделе кириллицей
		const current_week_day_index= data.days.indexOf(current_week_day); //номер текущий день в неделе в списке из гуглтаблицы
		//теперь нужно обрезать week_days_2 с текущего дня недели, чтобы в итоговом списке не было прошедших дней недели и пересечь с week_days_from_url - в итоге останутся доступные для записи текущий и будущие дни недели.
		var cutted_week_days = week_days_2.slice(n-1);

		var week_days_from_url = _.intersectionWith(cutted_week_days, data.days, _.isEqual);
		if (AdditionalButtons){for(var i=0; i<AdditionalButtons.length;i++){week_days_from_url.push(AdditionalButtons[i]);}}
//		week_days_from_url.push('След.неделя');
		week_days_from_url.push('Назад');

		var week_days_from_url = _.chunk(week_days_from_url,3); //разбиваем массив на тетрады для удобства отображения в виде кнопок бота
		//console.log('week_days_from_url',week_days_from_url);
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
	
}
function request(params,callback){
//делаем rest запрос к скрипту гуглтаблицы	//deprecared: подлежит замене на запрос в гуглкалендарь
/*	var qs = {
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
    });	*/

};
