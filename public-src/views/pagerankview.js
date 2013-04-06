var Backbone = require('backbone');
var _ = require('underscore');

var PageRankView = Backbone.View.extend({
    tagName: 'li',
    model: null,

    events: {
        'click .refresh': 'refresh',
        'click .delete': 'destroy'
    },

    initialize: function () {
        // todo: make this run exactly once, the first time the collection has 1+ elements
        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.model, "flash", this.flash);
        this.listenTo(this.model, "remove", this.remove);
        this.listenTo(this.model, "sync", this.sync);
        this.listenTo(this.model, "request", this.request);
        this.listenTo(this.model, "error", this.error);
    },

    prBarTemplate: _.template('<div class="prbar"><div class="prbar-inner" style="width: <%= (+pagerank || 0)  * 10 %>%"></div></div> - <%= pagerank %> -'),

    template: _.template('<div class="status"><%= status %></div> <a href="<%= url %>"><%= url %></a> <button type="button" class="refresh btn btn-success">Refresh</button> <button type="button" class="delete btn btn-danger">&times;</button>'),

    render: function () {
        this.$el.html(this.template({
            status: this.getStatus(),
            url: this.model.get('id')
        }));
        this.flash();
        return this;
    },


    getStatus: function () {
        var pr = this.model.get('pagerank');
        if (pr === undefined) {
            return "Unknown";
        } else if (pr === null) {
            return "Not ranked";
        } else {
            return this.prBarTemplate({
                pagerank: pr
            });
        }
    },

    setStatus: function (status) {
        this.$('.status').html(status);
    },

    request: function () {
        this.setStatus('Loading...');
        //this.$el.addClass('loading');
    },

    sync: function () {
        //this.$el.removeClass('loading');
        this.render();
    },

    error: function (model, response) {
        this.setStatus(response && response.status == 403 ? 'Pending...' : 'Error');
    },

    flash: function (times) {
        times = times || 1;
        var $el = this.$el;
        $el.addClass('flash');
        _.delay(function () {
            $el.removeClass('flash');
        }, times * 1000);
    },

    refresh: function () {
        this.model.fetch();
    },

    destroy: function () {
        // we don't want to actually destroy the model, just remove it from the colection
        this.model.trigger('destroy', this.model);
        this.remove();
    }
});

module.exports = PageRankView;
