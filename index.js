const Discord = require('discord.js');
const token = 'INSERT_TOKEN_HERE';

const client = new Discord.Client();

var reminders = [];

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    days = parseInt((duration / (1000 * 60 * 60 * 24)) % 365);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  if (days !== 0)
  	return days + " days " + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  else
  	return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}

// from https://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript

client.on('ready', () => {
	console.log('Bot is now connected');
	client.channels.find(x => x.name === 'general').send('Hello! I\'m ready to remind! Type \'!help\' for help');
});

client.on('message', (msg) => {
	if (msg.content === '!hello') {
		msg.channel.send(`Hello ${msg.author}!`, {tts: false});
	}
	
	if (msg.content === '!help') {
		const helpGuide = new Discord.RichEmbed()
			.setTitle("Help Guide for Reminder Bot")
			.addField('!remind', 'type \'!remind (time) (your reminder)\' for reminders. Here\'s some examples \'!remind 1d1h10m30s eat your veggies!\', \'!remind 23h10s go to sleep\'')
			.addField('!hello', 'says hello to the bot')
			.addField('!reminders', 'lists out your reminders')
			.setColor('#ffae42')

		msg.channel.send(helpGuide);
	}

	if (msg.content === "!reminders") {
		if (reminders.length === 0) {
			msg.channel.send("There are no reminders right now!");
		} else {
			var txt = "";
			var list = reminders.forEach(function(value, index, array){
				var d = new Date();
				txt = txt + (index + 1) + ". " + value.remindermsg + " (reminding in " + msToTime(value.starttime+value.timetowait - d.getTime()) + ")\n";
			});
			msg.channel.send("Here are your reminders: \n" + txt);
		}
	}

	if (msg.content.startsWith('!remind ')) {
		var reminderMsg = msg.content.substr(8,msg.end);
		
		if (reminderMsg == "") {
			msg.reply('Type !help to learn how to remind');
		} else if (reminderMsg.search(/[0-9]+(s|m|h|d){1}/) >= 0) {
			var time = reminderMsg.substring(0,reminderMsg.search(" ")).toLowerCase();
			var outputMsg = reminderMsg.substring(reminderMsg.search(" ") + 1, reminderMsg.end);
			var actualTime = 0;

			var magnitudes = time.split(/s|d|m|h/).filter(word => word != "");
			var typesOfTime = time.split(/[0-9]+/).filter(word => word != "");

			if ((magnitudes.length == typesOfTime.length) && (-1 == time.search(/a|b|c|e|f|g|i|j|k|l|n|o|p|q|r|t|u|v|w|x|y|z/))) {
				for (i = 0; i < magnitudes.length; i++) {
					switch (typesOfTime[i]) {
						case 's':
							actualTime += magnitudes[i]*1000;
							break;
						case 'm':
							actualTime += magnitudes[i]*60000;
							break;
						case 'h':
							actualTime += magnitudes[i]*3600000;
							break;
						case 'd':
							actualTime += magnitudes[i]*86400000;
							break;
						default:
						// nothing
					}
				}

				msg.channel.send(`${msg.author}, your reminder has been set for ` + msToTime(actualTime));
				var d = new Date();
				var reminder = {author: msg.author, remindermsg: outputMsg, starttime: d.getTime(), timetowait: actualTime};
				
				reminders.push(reminder);
				reminders.sort(function(a, b){return (a.starttime+a.timetowait) - (b.starttime+b.timetowait)});

				setTimeout(function() 
					{ console.log('worked');
					  reminders.shift();
					  msg.channel.send(`Hey ${msg.author}, This is a reminder to ` + outputMsg, {
						tts: true
					  });
					}, actualTime);
			} else {
				msg.reply('You formatted the time incorrectly it should only have numbers and the letters s, m, h and d and it should look like: \'4d20h30s\' or \'2h30m\' ');
			}
		} else {
			msg.reply('You probably formatted your reminder wrong, type !help to learn how to make reminders!')
		}
	}
});

client.login(token);

// things to add delete reminders