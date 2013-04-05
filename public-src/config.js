/*globals define:false, module:false, process:false*/

(function (root) {
    'use strict';

    var isDev = (typeof location != 'undefined' && location.hostname == 'localhost') || (typeof process != 'undefined' && process.env.NODE_ENV != 'production');

    var devConfig = {
        STRIPE_KEY: 'pk_test_UISfg44mvvob3QnCVacGMQQc',
        SITE: 'http://localhost:3000',
        SECURE_SITE: 'http://localhost:3000'
    };

    var prodConfig = {
        STRIPE_KEY: 'pk_live_jIp2eWrXfTNSUWtDFWMuIiK3', // this is the public ("publishable") key
        SITE: 'http://pagerank.nfriedly.com',
        SECURE_SITE: 'https://googlepagerank.herokuapp.com'
    };

    var config = isDev ? devConfig : prodConfig;

    if (typeof define == 'function') {
        define('config', [], config);
    } else if (typeof module != 'undefined') {
        module.exports = config;
    } else {
        root.config = config;
    }
})(this);
