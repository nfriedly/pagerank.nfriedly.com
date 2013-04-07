var Backbone = require('backbone');
//var _ = require('underscore');

var DeletedAlert = require('./deletedalert');
var PageRankView = require('./pagerankview');


var ResultsList = Backbone.View.extend({
    collection: null,
    list: null,
    visible: false,
    views: null,

    events: {
        "click a.close": "hideError",
        "click a.refresh-all": "refreshAll"
    },

    initialize: function ( /*options*/ ) {
        this.views = {};
        this.list = this.$('ul');

        this.listenTo(this.collection, 'add', this.addOne);
        this.listenTo(this.collection, 'error', this.error);
        this.listenTo(this.collection, 'remove', this.remove);
        this.listenTo(this.collection, 'moveToTop', this.moveToTop);

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
        this.views[pr.id] = view;
    },

    removeOne: function (model) {
        this.views[model.id].remove();
        delete this.views[model.id];
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

    remove: function (model) {
        new DeletedAlert({
            model: model,
            collection: this.collection
        }).render().insertAfter(this.$('h2'));
    },

    moveToTop: function (model) {
        var view = this.views[model.id];
        var el = view.$el.detach();
        this.list.prepend(el);
        view.$el.hide().slideDown();
    },

    refreshAll: function (event) {
        event.preventDefault();
        this.collection.each(function (model) {
            model.setPending(true);
        });
        this.collection.lookupPending();
    }
});

module.exports = ResultsList;
