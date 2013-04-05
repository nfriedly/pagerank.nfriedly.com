/*global alert:false*/
/*jshint scripturl:true*/
var Backbone = require('backbone');

var Bookmarklett = Backbone.View.extend({
    events: {
        "click": "handleClick",
        "dragend": "handleInstall"
    },

    initialize: function () {
        this.el.href = "javascript:void(window.open('http://" + location.host + "/#'+location.hostname+location.pathname, 'pagerank', 'scrollbars=1,width=450,height=200'))";
    },

    handleClick: function (event) {
        event.preventDefault();
        alert('To use this bookmarklett:\n\n1) Drag the "Get Pagerank" button to your bookmarks toolbar\n2) Navigate to the page you would like to look up\n3) Click the "Get Pagerank" bookmark you created in step 1');
        this.trigger('install', false);
    },

    handleInstall: function () {
        // we don't actually know that the bookmarklett was installed, but we're just going to pretend it was
        this.trigger('install', true);
    }

});
module.exports = Bookmarklett;
