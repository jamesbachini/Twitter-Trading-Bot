const Twitter = require('twitter');
const request = require('request');
const crypto = require('crypto');

const config = require('./config.js');

const client = new Twitter({
	consumer_key: config.twitterAPI.consumer_key,
	consumer_secret: config.twitterAPI.consumer_secret,
	access_token_key: config.twitterAPI.access_token_key,
	access_token_secret: config.twitterAPI.access_token_secret,
});

const getID = async (username) => {
	return new Promise((resolve, reject) => {
		client.get('users/lookup', {screen_name: username}, (error, tweets, response) => {
			if(error) throw error;
			const twitterID = JSON.parse(response.body)[0].id;
			resolve(twitterID);
		});
	});
}

const startStream = async () => {
	const keyword = config.keyword.toLowerCase();
	const twitterID = await getID(config.follow);
	const filter = { follow: twitterID }; //  { track: 'doge' };
	client.stream('statuses/filter', filter,  (stream) => {
		stream.on('data', (tweet) => {
			let tweetText = tweet.text;
			if (tweet.extended_tweet && tweet.extended_tweet.full_text) {
				tweetText = tweet.extended_tweet.full_text;
			}
			tweetText = tweetText.toLowerCase();
			if (tweet.user.id !== twitterID) return false;
			console.log(tweetText);
			if (tweetText.includes(keyword)) {
				executeTrade();
			} 
		});
		stream.on('error', (error) => {
			console.log(error);
		});
		stream.on('disconnect', (error) => {
			console.log('Stream Disconnected...');
			startStream();
		});
		console.log('Twitter API Stream Started');
	});
}

const ftxOrder = () => {
	const ts = new Date().getTime();
	const query = {
		market: config.market,
		side: 'buy',
		size: config.quantity,
		type: 'market',
		price: 0,
	}
	const queryString = `${ts}POST/api/orders${JSON.stringify(query)}`;
	const signature = crypto.createHmac('sha256', config.ftxAPI.apiSecret).update(queryString).digest('hex');
	const uri = `https://ftx.com/api/orders`;
	const headers = {
		"FTX-KEY": config.ftxAPI.apiKey,
		"FTX-TS": String(ts),
		"FTX-SIGN": signature,
		"FTX-SUBACCOUNT": config.ftxAPI.subAccount
	};
	request({headers,uri,method:'POST',body:query,json:true}, function (err, res, ticket) {
		if (err) console.log(err);
		if (ticket && ticket.result && ticket.result.id) {
			ftxTrailingStop();
		} else {
			console.log(ticket);
		}
	});
}

const ftxTrailingStop = () => {
	const ts = new Date().getTime();
	const query = {
		market: config.market,
		side: 'sell',
		trailValue: config.trailingStop,
		size: config.quantity,
		type: 'trailingStop',
		reduceOnly: true,
	}
	const queryString = `${ts}POST/api/conditional_orders${JSON.stringify(query)}`;
	const signature = crypto.createHmac('sha256', config.ftxAPI.apiSecret).update(queryString).digest('hex');
	const uri = `https://ftx.com/api/conditional_orders`;
	const headers = {
		"FTX-KEY": config.ftxAPI.apiKey,
		"FTX-TS": String(ts),
		"FTX-SIGN": signature,
		"FTX-SUBACCOUNT": config.ftxAPI.subAccount
	};
	request({headers,uri,method:'POST',body:query,json:true}, function (err, res, ticket) {
		if (err)  console.log(err);
		if (ticket && ticket.result && ticket.result.id) {
			console.log(`Trailing Stop Loss Set: ${ticket.result.id}`);
		} else {
			console.log(ticket);
		}
	});
}

const executeTrade = () => {
	console.log('Executing trade');
	ftxOrder();
}

startStream();

process.on('unhandledRejection', (reason, p) => {
	console.log('ERROR 110', reason);
});

