var Backbone = require('backbone');
var _ = require('underscore');

var DeletedAlert = Backbone.View.extend({
    model: null,
    collection: null,
    events: {
        'click .close': 'remove',
        'click .undo': 'undo'
    },
    template: _.template('<div class="alert alert-delete">' + '<button type="button" class="close">&times;</button>' + 'Deleted <%= id %>' + ' <button type="button" class="undo btn btn-info btn-small">Undo</button>' + '</div>'),

    render: function () {
        setTimeout(_.bind(this.remove, this), 30 * 1000);
        return this.$el.html(this.template({
            id: this.model.get('id')
        }));
    },

    undo: function () {
        this.collection.add(this.model);
        this.remove();
    }
});
module.exports = DeletedAlert;
