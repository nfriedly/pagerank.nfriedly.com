var Backbone = require('backbone');
var PageRank = require('../models/pagerank');

var PageRanks = Backbone.Collection.extend({
    model: PageRank,

    initialize: function () {
        //this.on("add", this.save); - only want to save when we have results back from the server
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
    }
});
module.exports = PageRanks;
