var Backbone = require('backbone');
var config = require('../config');

var SignupWrapper = Backbone.View.extend({
    collection: null,

    initialize: function() {
        this.listenTo(this.collection, 'error', this.handleModelError);
    },

    show: function(force) {
        this.$el.modal({
            //backdrop: !force,
            keyboard: !force
        });
        this.$('.close').toggle(!force);
        //this.$('#payment-notify').toggle( !! force);
        this.trigger('show', force);
        var self = this;
        this.$el.on('hide', function() {
            self.trigger('hide');
        });
    },
    render: function() {
        this.$('#signup-inner').html('<iframe id="signup-frame" name="signup-frame" src="' + config.SECURE_SITE + '/signup.html" scrolling="no" frameborder="0" seamless></iframe>');
        this.$iframe = this.$('iframe');
        this.iframe = this.$iframe[0];
    },
    remove: function() {
        this.win.removeEventListener('message', this.handleMessage, false);
    },
    handleModelError: function(model, response) {
        if (response && response.status == 403) this.show(true);
    },
    handleMessage: function(event) {
        // global console:false
        //console.log('parent message receved', event, JSON.parse(event.data));
        if (event.origin !== config.SECURE_SITE) return;
        var data = JSON.parse(event.data);
        if (data.cmd == 'purchase') {
            this.trigger('purchase', {
                plan: data.plan
            });
            this.$el.modal('hide');
            this.collection.lookupPending();
        }
    },
    sendMessage: function(msg) {
        this.iframe.contentWindow.postMessage(JSON.stringify(msg), config.SECURE_SITE);
    }
});

module.exports = SignupWrapper;
