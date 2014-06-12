/*global alert:false*/
var Backbone = require('backbone');
var _ = require('underscore');

var PageRank = require('../models/pagerank');

var FormView = Backbone.View.extend({
    collection: null,
    multiMode: false,
    events: {
        "click button": "handleLookupClick",
        "click .multimodetoggle": "toggleMultiMode"
    },
    input: null,

    initialize: function() {
        this.input = this.$('input');
        this.textarea = this.$('textarea');

        if (window.location.hash && window.location.hash.length > 3) {
            var url = window.location.hash.substr(1);
            this.lookup(url);
            this.trigger('lookup', 'Bookmarklett', url);
        }
    },

    handleLookupClick: function(event) {
        event.preventDefault();
        if (this.multiMode) this.lookupMultiple();
        else this.lookupSingle();
    },

    lookupSingle: function() {
        var id = this.input.val();
        if (!id) return alert('Please enter a URL first.');
        this.lookup(id);
        this.trigger('lookup', 'Single-line form', id);
        this.input.val("");
    },

    trimRegex: /^\s+|\s+$/g,
    trim: function(string) {
        return string.replace(/^\s+|\s+$/g, "");
    },

    lineRegex: /[\r\n]+/,
    getUrls: function() {
        var lines = this.textarea.val().split(this.lineRegex);
        return _.chain(lines).map(this.trim).compact().uniq().value();
    },

    lookupMultiple: function() {
        var ids = this.getUrls();
        if (!ids.length) return alert('Please enter one or more URLs first.');
        _.each(ids.reverse(), function(id) {
            this.lookup(id, true);
        }, this);
        this.trigger('lookup', 'Multi-line form', ids);
        this.textarea.val("");
        this.collection.lookupPending();
    },

    lookup: function(id, pending) {
        var pr = this.collection.get(id);
        if (pr && pr.newish()) {
            pr.trigger('moveToTop', pr);
            pr.flash();
        } else if (pr) {
            pr.trigger('moveToTop', pr);
            this.fetchOrPending(pr, pending);
        } else {
            pr = new PageRank({
                id: id
            });
            this.collection.add(pr);
            this.fetchOrPending(pr, pending);
        }
    },

    fetchOrPending: function(model, pending) {
        if (pending) model.setPending(true);
        else model.fetch();
    },

    toggleMultiMode: function(event) {
        if (this.multiMode) this.disableMultiMode();
        else this.enableMultiMode();
        event.preventDefault();
    },

    enableMultiMode: function() {
        this.multiMode = true;
        this.$('.single').slideUp();
        this.$('.multi').hide().slideDown();
        // get the urls already in the multi-line form & the one from the single-line form
        var urls = this.getUrls();
        var url = this.input.val();
        // make sure the url from the single-line form is in the list for the multi-line form
        if (!_.contains(urls, url)) {
            urls.unshift(url);
        }
        // add some empty lines to make copy-pasting easy
        var length = this.textarea.attr('rows') || 10;
        while (urls.length < length) {
            urls.push('');
        }
        // and update the multi-line form
        this.textarea.val(urls.join('\n'));

        // and an event for analytics
        this.trigger('modeChange', 'multimode');
    },

    disableMultiMode: function() {
        this.multiMode = false;
        this.trigger('modeChange', 'singlemode');
        this.$('.single').hide().slideDown();
        this.$('.multi').slideUp();
        var urls = this.getUrls();
        if (urls.length) {
            this.input.val(urls[0]);
        }
    }
});
module.exports = FormView;
