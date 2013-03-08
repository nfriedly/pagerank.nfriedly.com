var redis = require('redis');
var url = require('url');

var redisURL = url.parse(process.env.REDISCLOUD_URL);
var client = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
client.auth(redisURL.auth.split(":")[1]);

client.on("error", function (err) {
	console.error("Error " + err);
});

exports.maxPerIp = 10;
exports.prExpire = 24*60*60;
exports.ipExpire = 24*60*60;

exports.checkIpAllowed = function(ip, callback) {
	var key = (new Date()).getDate() + "-" + ip;
	client.incr(key, function(err, res) {
		// incr creates non-existant keys and gives them a value of 1
		if (res == 1) {
			client.expire(key, exports.ipExpire);
		}
		callback(err, res && res <= exports.maxPerIp);
	});
}

var URL_RE = /https?:\/\/([^#]+)(#.*)?/;
exports.normalize = function(url) {
	var results = URL_RE.exec(url);
	return results && results[1];
}

exports.getPr = function(url, callback) {
	client.get(exports.normalize(url), function(err, res) {
		var pr = parseInt(res, 10) || null;
		callback(err, pr);
	});
}

exports.setPr = function(url, pr) {
	var key = exports.normalize(url);
	client.set(key, pr);
}
