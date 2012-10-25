var util = require('util');
var PageRank = require('pagerank');
var express = require('express');
var app = express();

app.configure(function() {
	app.use(express.static(__dirname + '/public'));
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(require('less-middleware')({ src: __dirname + '/public' }));
});

app.configure('production', function() {
	app.enable('trust proxy');
	app.use(express.compress());
	app.use(function(req, res, next) {
		if (req.host == process.env.BASE_DOMAIN) {
			res.redirect(req.protocol + "://www." + req.host + req.originalUrl);
		} else {
			next();
		}
	});
});

app.get('/', function(req, res){
	res.render('index');
});

app.get('/pagerank', function(req, res) {
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
		
		var formats = {
			text: function(){
				res.type('.txt').send(text_pr);
			},
			html: function(){
				res.render('pagerank', data);
			},
			json: function(){
				res.jsonp(data);
			},
			js: function(){
				res.type('.js').send(util.format(
					'alert("Pagerank of %s\\n\\n%s\\n\\nProvided by %s");',
					url,
					text_pr,
					req.host
				));
			}
		};
		
		if (formats[req.query.format]) {
			formats[req.query.format]();
		} else {
			res.format(formats);
		}
	});
});

var port = process.env.PORT || 3000;
app.listen(port);
console.log('Listening on port ' + port);
