var Backbone = require('backbone');


var PageRank = Backbone.Model.extend({
    //collection: PageRanks, // this is a circular reference
    pagerank: undefined,
    timestamp: null,
    source: null,
    initialize: function (attrs /*, options*/ ) {
        if (typeof attrs.timestamp == "string") {
            attrs.timestamp = new Date(attrs.timestamp);
        }
        this.set('timestamp', attrs.timestamp || new Date());
        this.set('id', this.normalize(attrs.id || ""));
    },

    normalize: function (url) {
        if (url.substring(0, 2) == "//") {
            url = "http:" + url;
        }
        if (url.substring(0, 4) != "http") {
            url = "http://" + url;
        }
        return url;
    },

    newish: function () {
        return (this.age() <= 24 * 60 * 60);
    },

    age: function () {
        return ((new Date()).getTime() - this.get('timestamp').getTime()) / 1000;
    },

    url: function () {
        return 'pagerank?url=' + this.id;
    },

    parse: function (response) {
        // response is already parsed to JSON by jQuery because of the content-type headers
        if (response.error) {
            this.trigger('error', this, response);
            throw response;
        }
        response.id = this.normalize(response.url);
        delete response.url;
        if (response.timestamp && typeof response.timestamp != typeof (new Date())) {
            response.timestamp = new Date(response.timestamp);
        } else {
            response.timestamp = new Date();
        }
        return response;
    }
});
module.exports = PageRank;
