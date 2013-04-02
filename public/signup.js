/*global Backbone:false, $:false, _:false, StripeCheckout:false, config:false, _gaq:false, alert:false */

var SignupView = Backbone.View.extend({
    PLAN_RESET: 'reset',
    PLAN_PAYGO: 'paygo',
    events: {
        'click #reset-buy': 'buyReset',
        'click #paygo-signup': 'paygoSignup'
    },
    delayed_url: undefined,
    buyReset: function () {
        StripeCheckout.open({
            key: config.STRIPE_KEY,
            address: false,
            amount: 200,
            name: 'PageRank Lookup Limit Reset',
            description: '10 additional Google Pagerank Lookups',
            panelLabel: 'Checkout',
            token: this.getTokenHandler(this.PLAN_RESET)
        });
        _gaq.push(['_trackEvent', 'purchase-click', this.PLAN_RESET]);
        return false;
    },
    paygoSignup: function () {
        _gaq.push(['_trackEvent', 'purchase-click', this.PLAN_PAYGO]);
        alert('Thanks for your interest, this option will be avaliable soon!\nIn the meanwhile, please try out the 10 for $2 option');
        return false;
    },
    getTokenHandler: function (plan) {
        var self = this;
        return function (stripe_res) {
            $.post('/purchase/' + plan, stripe_res)
                .done(function (res) {
                self.sendMessage({
                    cmd: 'purchase',
                    plan: plan,
                    paid: res.paid
                });
                _gaq.push(['_trackEvent', 'purchase-complete', plan]);
            })
                .error(self.handleProvisionError);
            _gaq.push(['_trackEvent', 'purchase', plan]);
        };
    },
    handleProvisionError: function (xhr) {
        var data;
        try {
            data = JSON.parse(xhr.responseText);
        } catch (ex) {
            data = {
                error: 'Unknown error, unparsable server response. Please contact support with this message.\n\n' + (xhr ? xhr.responseText : '')
            };
        }
        var message = data.error || 'Unknown error, please contact support';
        message += '\n\nYour card was ' + (data.paid ? '' : 'NOT ') + 'charged';
        alert(message);
        _gaq.push(['_trackEvent', 'purchase-error', message]);
    },
    sendMessage: function (msg) {
        // todo: check if I need to use JSON
        parent.postMessage(JSON.stringify(msg), config.SITE);
    },
    handleMessage: function (msg) {
        // global console:false
        // console.log('iframe message recieved', msg, JSON.parse(msg.data));
        if (msg.origin != config.SITE) return;
        var data = JSON.parse(msg.data);
        if (data.cmd == 'echo') {
            this.sendMessage(data);
        }

    }
});


/*var signupView =*/
var signupView = new SignupView({
    el: $('#signup')
});

window.addEventListener('message', _.bind(signupView.handleMessage, signupView), false);
