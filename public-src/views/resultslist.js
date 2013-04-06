var Backbone = require('backbone');

var DeletedAlert = require('./deletedalert');
var PageRankView = require('./pagerankview');

//var PageRank = require('../models/pagerank');

var ResultsList = Backbone.View.extend({
    collection: null,
    list: null,
    visible: false,
    views: null,

    events: {
        "click a.close": "hideError"
    },

    initialize: function ( /*options*/ ) {
        this.views = {};
        this.list = this.$('ul');

        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'error', this.error);
        this.listenTo(this.collection, 'destroy', this.handleDestroy);

        if (this.collection.models.length) {
            this.collection.each(this.addOne, this);
        }

        this.errContainer = this.$('.alert-error');
        this.errBody = this.$('.alert-error p');

    },

    show: function () {
        if (!this.visible) {
            this.$el.show('fast');
            this.visible = true;
        }
    },

    addOne: function (pr) {
        this.show();
        var view = new PageRankView({
            model: pr
        });
        this.list.prepend(view.render().el);
        this.views[pr] = view;
    },

    removeOne: function (model) {
        this.views[model].remove();
        delete this.views[model];
    },

    hideError: function () {
        this.errContainer.slideUp();
    },

    error: function (model, data) {
        // signupView will handle this one
        if (data && data.status == 403) {
            return;
        }
        var msg;
        if (data && typeof data.error == "string") {
            msg = data.error;
        } else {
            msg = "Error communicating with server, please refresh the page and try again in a few minutes";
        }
        this.errBody.text(msg);
        this.errContainer.fadeIn();
    },

    handleDestroy: function (model) {
        new DeletedAlert({
            model: model,
            collection: this.collection
        }).render().insertAfter(this.$('h2'));
        this.collection.remove(model.get('id')); // todo: check if this is necessary - it should be automatic
    }
});

module.exports = ResultsList;
