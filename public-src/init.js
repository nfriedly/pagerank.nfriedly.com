/*globals $:false, _gaq:false*/
var _ = require('underscore');

if (window.location.pathname == "/signup.html") {
    signup();
} else {
    app();
}


function app() {
    var PageRanks = require('./collections/pageranks');
    var cachedResults = window.localStorage && window.localStorage.pageranks;
    var pageRanks = new PageRanks(cachedResults && JSON.parse(cachedResults) || []);
    pageRanks.on('change:pagerank', function (model, pr /*, options*/ ) {
        _gaq.push(['_trackEvent', 'PageRank', model.get('id'), pr]);
    });
    pageRanks.on('error', function (model, data) {
        var err = (data && data.status == 403) ? 'Ratelimit' : null;
        if (!err) {
            try {
                err = JSON.stringify(data);
            } catch (ex) {
                err = data;
            }
        }
        _gaq.push(['_trackEvent', 'Error', err, model.get('id')]);
    });

    var SignupWrapper = require('./views/signupwrapper');
    var signupWrapper = new SignupWrapper({
        el: $('#signup'),
        collection: pageRanks
    });
    signupWrapper.render();
    // message passing
    window.addEventListener('message', _.bind(signupWrapper.handleMessage, signupWrapper), false);
    // analytics
    signupWrapper.on('show', function (force) {
        _gaq.push(['_trackEvent', 'Purchase', 'signup-form', force ? 'auto' : 'manual']);
    });
    signupWrapper.on('purchase', function (data) {
        _gaq.push(['_trackEvent', 'Purchase', 'acknowledged', (data && data.plan) || '']);
    });
    // this one isn't worth making a view for
    $('#signup-link').click(function () {
        signupWrapper.show(false);
        return false;
    });

    var ResultsList = require('./views/resultslist');
    new ResultsList({
        el: $('#results'),
        collection: pageRanks
    });

    var FormView = require('./views/formview');
    var formView = new FormView({
        el: $('#lookup-form'),
        collection: pageRanks
    });
    formView.on('lookup', function (source, url) {
        var count = 1;
        if (_.isArray(url)) {
            count = url.length;
            url = url.join(', ');
        }
        _gaq.push(['_trackEvent', 'Lookup', source, url, count]);
    });
    formView.on('modeChange', function (mode) {
        _gaq.push(['_trackEvent', 'Mode Change', mode]);
    });


    var Bookmarklett = require('./views/bookmarklett');
    var bookmarklett = new Bookmarklett({
        el: $('#bookmarklett')
    });
    bookmarklett.on('install', function (success) {
        _gaq.push(['_trackEvent', 'Bookmarklett Install', success ? 'Success' : 'Fail']);
    });
}

function signup() {
    var SignupView = require('./views/signup');
    var signupView = new SignupView({
        el: $('#signup')
    });
    window.addEventListener('message', _.bind(signupView.handleMessage, signupView), false);
    signupView.on('purchase-click', function (plan) {
        _gaq.push(['_trackEvent', 'Purchase', 'click', plan]);
    });
    signupView.on('purchase', function (plan) {
        _gaq.push(['_trackEvent', 'Purchase', 'purchase', plan]);
    });
    signupView.on('purchase-complete', function (plan) {
        _gaq.push(['_trackEvent', 'Purchase', 'complete', plan]);
    });
    signupView.on('purchase-error', function (message) {
        _gaq.push(['_trackEvent', 'Purchase', 'error', message]);
    });
}
