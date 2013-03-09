var util = require('util');
var PageRank = require('pagerank');
var express = require('express');

var cache = require('./cache');

var app = express();

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
});

app.configure('production', function() {
	app.enable('trust proxy');
	app.use(express.compress());
});


function sendResponse(err, res, url, pr) {
	var data;
	if (err) {
		res.status(500);
		data = {error: 'Error looking up pagerank.'};
		console.error(data.error, url, err.message, err);
	} else {
		data = {pagerank: pr, url: url}
	}
	res.json(data);
}

function getPr(req, res, js) {
	if (!req.query.url) {
		res.redirect('/');
	}
	var url = decodeURIComponent(req.query.url);
	
	cache.getPr(url, function(err, pagerank) {
		if (pagerank !== null) {
			return sendResponse(null, res, url, pagerank);
		}
		cache.checkIpAllowed(req.connection.remoteAddress, function (err, allowed) {
			if (!allowed) {
				return res.status(403).json({error: "Sorry, you've hit the rate limit. Please try again in 24 hours."});
			}
			
			new PageRank(url, function(err, pr) {
				sendResponse(err, res, url, pr);
				cache.setPr(url, pr);
			});
		});
	});
}

app.get('/pagerank', function(req, res) {
	getPr(req, res, false);
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port);
