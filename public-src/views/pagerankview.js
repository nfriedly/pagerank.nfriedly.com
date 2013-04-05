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
    },

    template: _.template('<div class="prbar"><div class="prbar-inner" style="width: <%= (+pagerank || 0)  * 10 %>%"></div></div>' + ' - <%= pagerank %> - <a href="<%= url %>"><%= url %></a> ' + '<button type="button" class="refresh btn btn-success">Refresh</button>' + '<button type="button" class="delete btn btn-danger">&times;</button>'),

    render: function () {
        var pr = this.model.get('pagerank');
        if (pr === undefined) {
            pr = "Loading...";
            this.$el.addClass('loading');
        } else {
            this.$el.removeClass('loading');
        }
        if (pr === null) {
            pr = "Not ranked";
        }
        this.$el.html(this.template({
            pagerank: pr,
            url: this.model.get('id')
        }));

        this.flash();

        return this;
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
        this.model.set('pagerank', undefined);
        this.model.fetch();
    },

    destroy: function () {
        // we don't want to actually destroy the model, just remove it from the colection
        this.model.trigger('destroy', this.model);
        this.remove();
    }
});

module.exports = PageRankView;
