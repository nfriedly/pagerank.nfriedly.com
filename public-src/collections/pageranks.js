var Backbone = require('backbone');
var _ = require('underscore');

var PageRank = require('../models/pagerank');

var PageRanks = Backbone.Collection.extend({
    model: PageRank,
    delayMin: 1,
    delayMax: 3,

    initialize: function() {
        this.on("add", this.save);
        this.on("change", this.save);
        this.on('remove', this.save);
        this.on('error', this.handleError);
        this.on('sync', this.lookupPending);
    },

    get: function(id) {
        return Backbone.Collection.prototype.get.call(this, PageRank.prototype.normalize('' + id));
    },

    save: function() {
        if (window.localStorage) {
            window.localStorage.pageranks = JSON.stringify(this.toJSON());
        }
    },

    comparator: function(model) {
        // sorts by age, oldest first (the view adds new items to the top of the list, so oldest-first works)
        return model.get('timestamp').getTime();
    },

    pendingTimeout: null,

    // we keep the collection sorted in reverse order, so here we pop() off the last item
    getNextPending: function() {
        return this.filter(function(model) {
            return model.pending;
        }).pop();
    },

    // grabs the first pending model and sets a timeout to fetch it in a second or two.
    // when it's results are recieved then we'll fire this function again
    lookupPending: function() {
        var model = this.getNextPending();
        if (!model) return;
        model.trigger('preload', model);
        this.pendingTimeout = setTimeout(_.bind(model.fetch, model), this.getRandomDelay());
    },

    handleError: function( /*model, xhr*/ ) {
        clearTimeout(this.pendingTimeout);
    },

    // 1-3 second delay for when loading multiple PR's at once
    getRandomDelay: function() {
        return this.delayMin + (Math.random() * (this.delayMax - this.delayMin) * 1000);
    }
});
module.exports = PageRanks;
