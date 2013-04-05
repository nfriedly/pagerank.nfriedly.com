var Backbone = require('backbone');

var DeletedAlert = require('./deletedalert');
var PageRankView = require('./pagerankview');

var ResultsList = Backbone.View.extend({
    collection: null,
    list: null,
    visible: false,
    views: null,
    signupView: null,

    events: {
        "click a.close": "hideError"
    },

    initialize: function (options) {
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

        this.signupView = options.signupView;
        this.listenTo(this.signupView, 'purchase', this.retry);
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

    retry: function () {
        var pr = this.failed_model;
        if (pr) {
            pr.fetch();
            this.addOne(pr);
            delete this.failed_model;
        }
    },

    hideError: function () {
        this.errContainer.slideUp();
    },

    error: function (model, data) {
        this.failed_model = model;
        if (data.status == 403) {
            this.signupView.show(true); // todo: decouple this
        } else {
            var msg;
            if (data && typeof data.error == "string") {
                msg = data.error;
            } else {
                msg = "Error communicating with server, please refresh the page and try again in a few minutes";
            }
            this.errBody.text(msg);
            this.errContainer.fadeIn();
            if (window.console && window.console.error) {
                window.console.error(msg, data, model);
            }
        }
        this.collection.remove(model.id);
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
