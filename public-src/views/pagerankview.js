var Backbone = require('backbone');
var _ = require('underscore');

var PageRankView = Backbone.View.extend({
    tagName: 'li',
    model: null,

    events: {
        'click .refresh': 'refresh',
        'click .delete': 'destroy'
    },

    initialize: function() {
        // todo: make this run exactly once, the first time the collection has 1+ elements
        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.model, "flash", this.flash);
        this.listenTo(this.model, "remove", this.remove);
        this.listenTo(this.model, "sync", this.sync);
        this.listenTo(this.model, "request", this.request);
        this.listenTo(this.model, "error", this.error);
        this.listenTo(this.model, "pending", this.pending);
        this.listenTo(this.model, "preload", this.preLoad);
    },

    prBarTemplate: _.template('<div class="prbar"><div class="prbar-inner" style="width: <%= (+pagerank || 0)  * 10 %>%"></div></div> - <%= pagerank %> -'),

    template: _.template('<div class="status"><%= status %></div> <a href="<%= url %>" target="_blank"><%= url %></a> <div class="buttons"><button type="button" class="refresh btn btn-success">Refresh</button> <button type="button" class="delete btn btn-danger">&times;</button></div>'),

    render: function() {
        this.$el.html(this.template({
            status: this.getStatus(),
            url: this.model.get('id')
        }));
        this.flash();
        return this;
    },


    getStatus: function() {
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

    loadingTemplate: '<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>',
    pendingTemplate: '<div class="progress progress-striped"><div class="bar" style="width: 100%;"></div></div>',

    setStatus: function(status) {

        this.$('.status').html(status);
    },

    request: function() {
        this.setStatus(this.loadingTemplate);
        //this.$el.addClass('loading');
    },

    sync: function() {
        //this.$el.removeClass('loading');
        this.render();
    },

    error: function(model, response) {
        this.setStatus(response && response.status == 403 ? this.loadingTemplate : 'Error');
    },

    flash: function(model, times) {
        times = times || 1;
        var $el = this.$el;
        $el.addClass('flash');
        _.delay(function() {
            $el.removeClass('flash');
        }, times * 1000);
    },

    refresh: function() {
        this.model.fetch();
    },

    pending: function() {
        this.setStatus(this.pendingTemplate);
    },

    preLoad: function() {
        this.setStatus(this.loadingTemplate);
    },

    destroy: function() {
        // we don't want to actually destroy the model, just remove it from the collection 
        // (and hand it over to the 'undo' view)
        this.model.collection.remove(this.model.get('id'));
    }
});

module.exports = PageRankView;
