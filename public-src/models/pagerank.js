var Backbone = require('backbone');


var PageRank = Backbone.Model.extend({
    //collection: PageRanks, // this is a circular reference
    pending: false,
    initialize: function(attrs /*, options*/ ) {
        if (typeof attrs.timestamp == "string") {
            attrs.timestamp = new Date(attrs.timestamp);
        }
        this.set('timestamp', attrs.timestamp || new Date());
        this.set('id', this.normalize(attrs.id || ""));
        this.status = (attrs.pagerank === undefined) ? PageRank.NOT_LOADED : PageRank.LOADED;

        this.on('error', this.handleError);
        this.on('request', this.notPending);
    },

    normalize: function(url) {
        if (url.substring(0, 2) == "//") {
            url = "http:" + url;
        }
        if (url.substring(0, 4) != "http") {
            url = "http://" + url;
        }
        return url;
    },

    // less than a day old & with a defined pagerank
    newish: function() {
        return (this.age() <= 24 * 60 * 60) && this.get('pagerank') !== undefined;
    },

    age: function() {
        return ((new Date()).getTime() - this.get('timestamp').getTime()) / 1000;
    },

    url: function() {
        return '/api/pagerank?url=' + this.id;
    },

    parse: function(response) {
        // response is already parsed to JSON by jQuery because of the content-type headers
        if (response.error) {
            this.status = PageRank.NOT_LOADED;
            this.trigger('error', this, response);
            throw response;
        }
        response.id = this.normalize(response.url);
        delete response.url;
        if (response.timestamp && typeof response.timestamp != typeof(new Date())) {
            response.timestamp = new Date(response.timestamp);
        } else {
            response.timestamp = new Date();
        }
        return response;
    },

    handleError: function(model, response) {
        this.pending = (response && response.status == 403);
    },

    notPending: function() {
        this.setPending(false);
    },

    setPending: function(pending) {
        this.pending = !!pending;
        if (this.pending) {
            this.trigger('pending');
        }
    },

    flash: function(duration) {
        this.trigger('flash', this, duration || 3);
    }
});

module.exports = PageRank;
