var PageRank = require('pagerank');
var express = require('express');
var stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

var cache = require('./cache');

var app = express();

app.configure(function () {
    app.use(express.static(__dirname + '/public'));
    app.disable('x-powered-by');
    app.use(express.bodyParser());
});

app.configure('production', function () {
    app.enable('trust proxy');
    app.use(express.compress());
});

function getIp(req) {
    if (req.headers['x-forwarded-for']) {
        // this header can be faked, in that case heroku adds the real ip at the end
        return req.headers['x-forwarded-for'].split(', ').pop();
    }
    // for local development
    return req.connection.remoteAddress;
}

function sendResponse(err, res, url, pr) {
    var data;
    if (err) {
        res.status(500);
        data = {
            error: 'Error looking up pagerank.'
        };
        console.error(data.error, url, err.message, err);
    } else {
        data = {
            pagerank: pr,
            url: url
        };
    }
    res.json(data);
}

function getPr(req, res) {
    if (!req.query.url) {
        res.redirect('/');
    }
    var url = decodeURIComponent(req.query.url);

    cache.getPr(url, function (err, pagerank) {
        if (pagerank !== null) {
            return sendResponse(null, res, url, pagerank);
        }
        cache.checkIpAllowed(getIp(req), function (err, allowed, used) {
            res.setHeader('X-Free-Lookups-Used', used);
            if (!allowed) {
                return res.status(403).json({
                    error: "Sorry, you've hit the rate limit. Please try again in 24 hours."
                });
            }

            new PageRank(url, function (err, pr) {
                sendResponse(err, res, url, pr);
                cache.setPr(url, pr);
            });
        });
    });
}

app.get('/pagerank', function (req, res) {
    getPr(req, res, false);
});


app.post('/purchase/reset', function (req, res) {
    console.log(req.body);
    stripe.charges.create({
        amount: 200,
        currency: 'USD',
        card: req.body.id,
        description: 'PageRank Lookup Limit Reset'
    }, function (stripe_response) {
        console.log(stripe_response);
        cache.resetIp(getIp(req), function (err) {
            if (err) {
                return res.status(500).json({
                    err: err,
                    stripe_response: stripe_response
                });
            }
            res.json(stripe_response);
        });
    });
});

module.exports = app;
