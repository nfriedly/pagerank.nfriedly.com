/*global alert:false*/

var Backbone = require('backbone');
var PageRank = require('../models/pagerank');

var FormView = Backbone.View.extend({
    collection: null,
    events: {
        "click button": "handleLookupClick"
    },
    input: null,

    initialize: function () {
        this.input = this.$('input');

        if (window.location.hash && window.location.hash.length > 3) {
            var url = window.location.hash.substr(1);
            this.lookup(url);
            this.trigger('lookup', 'Bookmarklett', url);
        }
    },

    handleLookupClick: function (event) {
        event.preventDefault();
        var id = this.input.val();
        if (!id) return alert('Type in a URL first!');
        this.lookup(id);
        this.trigger('lookup', 'Click', id);
        this.input.val("");
    },

    lookup: function (id) {
        var pr = this.collection.get(id);
        if (pr && pr.newish()) {
            pr.trigger('flash', 3);
        } else {
            pr = new PageRank({
                id: id
            });
            pr.fetch();
            this.collection.add(pr);
        }
    }
});
module.exports = FormView;
