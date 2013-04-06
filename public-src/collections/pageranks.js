var Backbone = require('backbone');
var _ = require('underscore');

var PageRank = require('../models/pagerank');

var PageRanks = Backbone.Collection.extend({
    model: PageRank,

    initialize: function () {
        this.on("add", this.save);
        this.on("change", this.save);
        this.on('remove', this.save);
    },

    get: function (id) {
        return Backbone.Collection.prototype.get.call(this, PageRank.prototype.normalize('' + id));
    },

    save: function () {
        if (window.localStorage) {
            window.localStorage.pageranks = JSON.stringify(this.toJSON());
        }
    },

    comparator: function (model) {
        // sorts by age, oldest first (the view adds new items to the top of the list, so oldest-first works)
        return model.get('timestamp').getTime();
    },

    reloadPending: function () {
        var pendingModels = this.filter(function (model) {
            return model.pending;
        });
        // todo: improve the logic here to put some delay in-between fetches
        _.each(pendingModels, function (model) {
            model.fetch();
        });
    }
});
module.exports = PageRanks;
