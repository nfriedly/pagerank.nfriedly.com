var PageRank = require('pagerank');
var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser');
var stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

var cache = require('./cache');

var app = express();

app.use(express.static(__dirname + '/public'));
app.disable('x-powered-by');
app.disable('etag'); // keep things simple
app.use(bodyParser.urlencoded());

var env = process.env.NODE_ENV || 'development';

if (env == 'production') {
    app.enable('trust proxy');
    app.use(connect.compress());
}

function checkAuth(req, res, next) {
    cache.checkIpAllowed(getIp(req), function(err, allowed, used) {
        res.setHeader('X-Free-Lookups-Used', used);
        if (!allowed) {
            return res.status(403).json({
                error: "Sorry, you've hit the rate limit. Please try again in 24 hours."
            });
        }
        next();
    });
}

function getIp(req) {
    if (req.headers['x-forwarded-for']) {
        // cloudfront first, then heroku. todo: handle fakes if 3 or more are present 
        return req.headers['x-forwarded-for'].split(', ').shift();
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

    cache.getPr(url, function(err, pagerank) {
        if (pagerank !== null) {
            res.setHeader('X-PR-Source', 'Cache');
            return sendResponse(null, res, url, pagerank);
        }

        new PageRank(url, function(err, pr) {
            res.setHeader('X-PR-Source', 'Live');
            sendResponse(err, res, url, pr);
            cache.setPr(url, pr);
        });
    });
}

app.get('/api/pagerank', checkAuth, function(req, res) {
    res.setHeader('Cache-Control', 'no-cache');
    getPr(req, res, false);
});

app.get('/api/headers', function(req, res) {
    req.headers.getIp = getIp(req);
    res.json(req.headers);
});

app.post('/api/purchase/reset', function(req, res) {
    console.log(req.body);
    stripe.charges.create({
        amount: 200,
        currency: 'USD',
        card: req.body.id,
        description: 'PageRank Lookup Limit Reset'
    }, function(err, stripe_response) {
        if (err) {
            return res.status(402).json({
                paid: false,
                error: err.message || err.name || 'Unknown error: ' + err.toString()
            });
        }
        cache.resetIp(getIp(req), function(err) {
            if (err) {
                try {
                    err = JSON.stringify(err);
                } catch (ex) {}
                return res.status(500).json({
                    error: 'Internal error resetting your account, please contact support.\n\nTechnical details cache reset issue:\n' + err,
                    paid: stripe_response.paid
                });
            }
            res.json({
                paid: stripe_response.paid
            });
        });
    });
});

app.post('/api/purchase/paygo', function(req, res) {
    console.dir(req.body);
    var customer = stripe.customer.create({
        card: req.body.id,
        plan: "paygo",
        email: req.body.email
    }, function(err, stripe_response) {
        console.dir(err, stripe_response);
        console.dir('customer', customer);
        // todo: create session
        res.json(err || stripe_response);
    });
});

// todo: create & destroy session on persona login/out, (checking email against stripe)
// update checkAuth to check for valid session and allow through
// ad new filter create a charge before (after?) successful lookup

module.exports = app;
