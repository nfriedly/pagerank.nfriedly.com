var Backbone = require('backbone');


var User = Backbone.Model.extend({

    initialize: function () {
        this.on("change", this.save);
    },

    save: function () {
        if (window.localStorage) {
            window.localStorage.user = JSON.stringify(this.toJSON());
        }
    }
});

function getUser() {
    // todo: make this better
    var data = (window.localStorage && localStorage.user && JSON.parse(localStorage.user)) || {};
    return new User(data);
}

User.getUser = getUser;

module.exports = User;
