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
        el: $('#signup')
    });
    signupWrapper.render();
    // message passing
    window.addEventListener('message', _.bind(signupWrapper.handleMessage, signupWrapper), false);
    // analytics
    signupWrapper.on('show', function (force) {
        _gaq.push(['_trackEvent', 'signup-form', force ? 'auto' : 'manual']);
    });
    signupWrapper.on('purchase', function (data) {
        _gaq.push(['_trackEvent', 'purchase', (data && data.plan) || '']);
    });
    // this one isn't worth making a view for
    $('#signup-link').click(function () {
        signupWrapper.show(false);
        return false;
    });

    var ResultsList = require('./views/resultslist');
    new ResultsList({
        el: $('#results'),
        collection: pageRanks,
        signupView: signupWrapper
    });

    var FormView = require('./views/formview');
    var formView = new FormView({
        el: $('#lookup-form'),
        collection: pageRanks
    });
    formView.on('lookup', function (source, url) {
        _gaq.push(['_trackEvent', 'Lookup', source, url]);
    });


    var Bookmarklett = require('./views/bookmarklett');
    var bookmarklett = new Bookmarklett({
        el: $('#bookmarklett')
    });
    bookmarklett.on('install', function (success) {
        _gaq.push(['_trackEvent', 'Install', success ? 'Success' : 'Fail']);
    });
}

function signup() {
    var SignupView = require('./views/signup');
    var signupView = new SignupView({
        el: $('#signup')
    });
    window.addEventListener('message', _.bind(signupView.handleMessage, signupView), false);
    signupView.on('purchase-click', function (plan) {
        _gaq.push(['_trackEvent', 'purchase-click', plan]);
    });
    signupView.on('purchase', function (plan) {
        _gaq.push(['_trackEvent', 'purchase', plan]);
    });
    signupView.on('purchase-complete', function (plan) {
        _gaq.push(['_trackEvent', 'purchase-complete', plan]);
    });
    signupView.on('purchase-error', function (message) {
        _gaq.push(['_trackEvent', 'purchase-error', message]);
    });
}
