var util = require('util');
var PageRank = require('pagerank');
var express = require('express');
var app = express();

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
});

app.configure('production', function() {
	app.enable('trust proxy');
	app.use(express.compress());
});


//var index = require('fs').readFileSync('./views/index.html').toString();
//app.get('/', function(req, res){
//	res.send(index);
//});

function getPr(req, res, js) {
	if (!req.query.url) {
		res.redirect('/');
	}
	var url = decodeURIComponent(req.query.url);

	new PageRank(url, function(err, pr) {
		var text_pr = (pr === null) ? 'unknown' : pr.toString();
		var data = {pagerank: pr, url: url};
		
		if (err) {
			res.status(500);
			text_pr = 'error';
			data = data.error = err;
			console.log('Error looking up pagerank', err);
		}
		if (js) {
			res.type('.js').send(util.format(
				'alert("Pagerank of %s\\n\\n%s\\n\\nProvided by %s");',
				url,
				text_pr,
				req.host
			));
		} else {
			res.json(data);
		}
	});
}

app.get('/pagerank', function(req, res) {
	getPr(req, res, false);
});

// bookmarklett
app.get('/pagerank.js', function(req, res) {
	getPr(req, res, true);
});


var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port);
