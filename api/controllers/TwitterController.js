/**
 * TwitterController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var config;
try {
	config = require('../../config/local.js');
}catch(e){
	config={};
}


var twitter = require('twitter') 
, twit = new twitter(config.twitter_keys)
, tweets = []
, clients = [];

module.exports = {
	index : function(req,res){
		var data = searchTweets(function(tweets){
			var array = [];
			tweets.forEach(function(tweet){
				var retweet_source = false;
				if(tweet.retweeted_status){
					var retweet_source = {
						user : tweet.retweeted_status.user.screen_name,
					}
				}

				array.push({
					user : tweet.user.screen_name,
					tweet : tweet.text,
					retweet_source : retweet_source,					
				});
			})
			res.json(array);
		});
	}
};
function searchTweets(callback){
	twit.search('@betoborge',{count:200}, function(data){
		data = data && data.statuses ? data.statuses : false;
		callback(data);
	});
}

function newTweets(data){
	clients.forEach(function(e){
		e.emit('newTweet',data);
	});
}

function addData(t,i){
	var suspect = {screen_name:t.user.screen_name};
	console.log('new tweet from user: '+suspect.screen_name);
	Suspect.findOrCreate(suspect,suspect,function(e,s){
		if(e) throw(e);
		console.log(s);
	});
}
function replaceURLWithHTMLLinks(text) {
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	return text.replace(exp,"<a href='$1' target='_blank'>$1</a>"); 
}
function replaceHashTags(text) {
	var exp = /#(\S*)/ig;
	return text.replace(exp,"<a href='http://twitter.com/#!/search/$1'  target='_blank' >#$1</a>"); 
}
function replaceMentions(text) {
	var exp = /@(\w{3,})/ig;
	return text.replace(exp,"<a href='http://twitter.com/$1'  target='_blank' >@$1</a>"); 
}

twit.stream('statuses/filter', {track:'betoborge'},function(stream){
	if(stream)
		stream.on('data', addData);
});


