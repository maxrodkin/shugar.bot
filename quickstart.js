const max_working_hours_per_day = 13;
var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
const _ = require('lodash');
var moment = require('moment');
moment().format();
moment.locale('ru');
const week_days_2 = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];//дни недели

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/calendar-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-nodejs-quickstart.json';
//debugger;
// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Google Calendar API.
  /*authorize(
  {"content":JSON.parse(content)
  ,'get_week_days':true
  ,'next_week':false
  }
  , queryFreebusy);*/
  
  authorize(
  {"content":JSON.parse(content)
  ,'get_week_days':true
  ,'next_week':true//false
  }
  , queryFreebusy);/**/

  });

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(params, callback) {
	var credentials = params.content;
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
	if (err) {
	  getNewToken(oauth2Client, callback);
	} else {
	  oauth2Client.credentials = JSON.parse(token);
	  callback(oauth2Client,params.get_week_days,params.next_week);
	}
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  //Authorize this app by visiting this url:  //https://accounts.google.com/o/oauth2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar.readonly&response_type=code&client_id=480551984351-gt7p9l7qtp4o4he3iuf5t6vibpongc7u.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listEvents(auth) {
  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 20,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      console.log('Upcoming 20 events:');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        var end = event.end.dateTime || event.end.date;
        console.log('%s - %s', start,end, event.summary);
      }
    }
  });
}
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function getLastSunday(d) {
  var t = new Date(d);
  t.setDate(t.getDate() - t.getDay());
  return t;
}
function queryFreebusy(auth,get_week_days,next_week) {
	
	var startOfWeek = moment().startOf('week').toDate();
	var endOfWeek   = moment().endOf('week').toDate();
//	console.log('endOfWeek',endOfWeek);
	var calendar = google.calendar('v3');
	var currentDate = moment();
	//currentDate.setHours(currentDate.getHours()+3);//+3 - мск время
	console.log('next_week?',next_week);
	var currentDay = moment()//currentDate.getDate();//ищем  текущий день
	var currentWeekSunday = moment().endOf('week');// getLastSunday(currentDate);//currentDate.getDate() - currentDate.getDay() +7;//ищем воскресение текущей недели
	var nextWeekMonday = currentWeekSunday.add(1, 'days') //currentWeekMonday +7;//ищем понедельник следующей недели
	var nextWeekSunday = currentWeekSunday.add(6, 'days')//addDays(currentWeekSunday,7);//ищем воскресение следующей недели
	var start_Date = (next_week)?nextWeekMonday:currentDate;//currentDate
	var start_Date_week_day=start_Date.day();
	var end_Date = (next_week)?nextWeekSunday:currentWeekSunday;//nextWeekSundayDate
	console.log('start_Date',start_Date);
	console.log('end_Date',end_Date);/**/
	
	calendar.events.list({
		auth: auth,
		calendarId: 'primary',
		timeMin: start_Date.toDate().toISOString(),
		timeMax: end_Date.toDate().toISOString(),
		singleEvents: true,
		orderBy: 'startTime'
		}, function(err, response) {
		if (err) {
		  console.log('The API returned an error: ' + err);
		  return;
		}
		var events = response.items;
		var busy_days = [];
		if (events.length == 0) {
		  console.log('No upcoming events found.');
		} else {
		  //console.log('Upcoming '+events.length+' events:');
		  var days_with_busy_hours = {};
		  for (var i = 0; i < events.length; i++) {
			var event = events[i];
			var start = event.start.dateTime || event.start.date;
			var end = event.end.dateTime || event.end.date;
			var startDateTime = new Date(start);
			var endDateTime = new Date(end);
			var duration = (endDateTime - startDateTime)/3600000;
			var startHour = startDateTime.getHours();
			var endHour = endDateTime.getHours();
			var startDate = startDateTime.getDate();
			var startDay = startDateTime.getDay();if(startDay==0){startDay=7};//приводим вск к стандарту РФ
			var end = event.end.dateTime || event.end.date;
			var isstartDateInCurrentWeek = (startDateTime>currentWeekSunday)?true:false;
			var key = week_days_2[startDay-1];
			//console.log('key',key);
			//console.log('days_with_busy_hours[key]',days_with_busy_hours[key]);
			if (!days_with_busy_hours[key]){days_with_busy_hours[key]=0;}
			//days_with_busy_hours[key] = days_with_busy_hours[key]+duration;
			//console.log('Прием', 'число' , startDate, 'час', startHour, (isstartDateInCurrentWeek)? 'На этой неделе':'На следующей неделе' , week_days_2[startDay-1],'Длительность',duration);
		  }
		//console.log(JSON.stringify({'days_with_busy_hours':days_with_busy_hours}));
		for (var objectKey in days_with_busy_hours){	
		  if (days_with_busy_hours[objectKey]>=max_working_hours_per_day){//если занятых часов в дне более порога, то добавляем день в позностью занятые дни
			  busy_days.push(objectKey);
			  } 
		  }  
		}
		console.log(JSON.stringify({'days':_.difference(_.drop(week_days_2,start_Date_week_day),busy_days)}));
	});
}