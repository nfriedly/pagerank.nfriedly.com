var Backbone = require('backbone');

var Welcome = Backbone.View.extend({
    model: null,

    events: {
        'click .close': 'saveDismiss'
    },

    render: function () {
        if (!this.model.get('newSiteDismissed')) {
            this.$el.show();
        }
    },

    saveDismiss: function () {
        this.model.set('newSiteDismissed', true);
        this.$el.hide();
    }
});
module.exports = Welcome;
