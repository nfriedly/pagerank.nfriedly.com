var isDev = (typeof location != 'undefined' && location.hostname == 'localhost');

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

module.exports = config;
