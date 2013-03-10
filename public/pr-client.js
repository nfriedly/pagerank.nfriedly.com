var PageRank = Backbone.Model.extend({
	collection: PageRanks,
	pagerank: undefined,
	timestamp: null,
	source: null,
	initialize: function(attrs, options) {
		if (typeof attrs.timestamp == "string" ) {
			attrs.timestamp = new Date(attrs.timestamp);
		}
		this.set('timestamp', attrs.timestamp || new Date());
		this.set('id', this.normalize(attrs.id || ""));

		this.on('change:pagerank', this.trackPr, this);
		this.on('error', this.trackErr, this)
	},
	
	normalize: function(url) {
		if (url.substring(0,2) == "//") {
			url = "http:" + url;
		}
		if (url.substring(0,4) != "http") {
			url = "http://" + url;
		}
		return url;
	},
	
	newish: function() {
		return (this.age() <= 24*60*60);
	},
	
	age: function() {
		return ( (new Date()).getTime() - this.get('timestamp').getTime() )/1000;
	},
	
	url: function() {
		return 'pagerank?url=' + this.id;
	},
	
	parse: function(response) {
		// response is already parsed to JSON by jQuery because of the content-type headers
		if (response.error) {
			this.trigger('error', this, response);
			throw response;
		}
		response.id = this.normalize(response.url);
		delete response.url;
		if (response.timestamp && typeof response.timestamp != typeof (new Date())) {
			response.timestamp = new Date(response.timestamp);
		}
		return response;
	},
	
	trackPr: function() {
		_gaq.push(['_trackEvent', 'PageRank', this.get('id'), this.get('pagerank')]);
	}
	
	trackErr: function(model, data) {
		var err = (data && data.status == 403) ? 'Ratelimit' : null;
		if (!err) {
			try {
				err = JSON.stringify(data);
			} catch (ex) {
				err = data;
			}
		}
		_gaq.push(['_trackEvent', 'Error', err, this.get('id')]);
	}
});

var PageRanks = Backbone.Collection.extend({
	model: PageRank,
	
	initialize: function() {
		//this.on("add", this.save); - only want to save when we have results back from the server
		this.on("change", this.save);
	},
	
	get: function(id) {
		return Backbone.Collection.prototype.get.call(this, PageRank.prototype.normalize('' + id));
	},
	
	save: function() {
		if (window.localStorage) {
			window.localStorage.pageranks = JSON.stringify(this.toJSON());
		}
	}
});

var cachedResults = window.localStorage && window.localStorage.pageranks;
var pageRanks = new PageRanks(cachedResults && JSON.parse(cachedResults) || []);

var PageRankView = Backbone.View.extend({
	tagName: 'li',
	model: null,
	
	initialize: function() {
		// todo: make this run exactly once, the first time the collection has 1+ elements
    	this.listenTo(this.model, "change", this.render);
    	this.listenTo(this.model, "flash", this.flash);
	},
	
	template: _.template('<div class="prbar"><div class="prbar-inner" style="width: <%= (+pagerank || 0)  * 10 %>%"></div></div>'
		+ ' - <%= pagerank %> - <a href="<%= url %>"><%= url %></a>'),
	
	render: function() {
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
		this.$el.html(this.template({pagerank: pr, url: this.model.get('id')}));
		
		this.flash();
		
		return this;
	},
	
	flash: function(times) {
		times = times || 1;
		var $el = this.$el;
		$el.addClass('flash');
		_.delay(function() {
			$el.removeClass('flash');
		}, times * 1000);
	}
});

var ResultsList = Backbone.View.extend({
	collection: null,
	list: null,
	visible: false,
	views: null,
	
	events: {
		"click a.close": "hideError"
	},
	
	initialize: function() {
		this.views = {};
    	this.list = this.$('ul');
    	
    	this.listenTo(this.collection, 'add', this.addOne);
    	this.listenTo(this.collection, 'remove', this.removeOne);
    	this.listenTo(this.collection, 'error', this.error);
    	
    	if (this.collection.models.length) {
    		this.collection.each(this.addOne, this);
    	}
    	
    	this.errContainer = this.$('.alert-error');
    	this.errBody = this.$('.alert-error p');
	},
	
	show: function() {
		if(!this.visible) {
			this.$el.show('fast');
    		this.visible = true;
		}
	},

	addOne: function(pr) {
		this.show();
    	var view = new PageRankView({model: pr});
    	this.list.prepend(view.render().el);
    	this.views[pr] = view;
	},
	
	removeOne: function(model) {
		this.views[model].remove();
		delete this.views[model];
	},
	
	hideError: function() {
		this.errContainer.slideUp();
	},
	
	error: function(model, data) {
		var msg;
		if (data && typeof data.error == "string") {
			msg = data.error;
		} else if (data.status == 403) {
			// this is actually the text in the ajax response, but I think some browsers don't provide non-200 responses
			msg = "Sorry, you've hit the rate limit. Please try again in 24 hours."; 
		} else if (data.readyState) {
			msg = "Error communicating with server, please refresh the page and try again in a few minutes";
		}
		this.errBody.text(msg);
		this.errContainer.fadeIn();
		if (window.console && window.console.error) {
			window.console.error(msg, data, model);
		}
		this.collection.remove(model.id);
	}
});

new ResultsList({el: $('#results'), collection: pageRanks});

var FormView = Backbone.View.extend({
	events: {
		"click button": "handleLookupClick"
	},
	input: null,
	
	initialize: function() {
		this.input = this.$('input');
		
		if (window.location.hash && window.location.hash.length > 3) {
			var url = window.location.hash.substr(1);
			this.lookup(url);
			_gaq.push(['_trackEvent', 'Lookup', 'Bookmarklett', url]);
		}
	},
	
	handleLookupClick: function(event) {
		event.preventDefault();
		var id = this.input.val();
		if (!id) return alert('Type in a URL first!');
		this.lookup(id);
		_gaq.push(['_trackEvent', 'Lookup', 'Click', id]);
	},
	
	lookup: function(id) {
		var pr = pageRanks.get(id)
		if (pr && pr.newish()) {
			pr.trigger('flash', 3);
		} else {
			pr = new PageRank({id: id});
			pr.fetch();
			pageRanks.add(pr);
		}
	}
});

new FormView({el: $('#lookup-form')});

var Bookmarklett = Backbone.View.extend({
	events: {
		"click" : "handleClick",
		"dragend": "handleInstall"
	},

	initialize: function() {
  		this.el.href = "javascript:void(window.open('http://" + location.host + "/#'+location.hostname+location.pathname, 'pagerank', 'scrollbars=1,width=450,height=200'))";
  	},
	
	handleClick: function(event) {
		event.preventDefault();
		alert('To use this bookmarklett:\n\n1) Drag the "Get Pagerank" button to your bookmarks toolbar\n2) Navigate to the page you would like to look up\n3) Click the "Get Pagerank" bookmark you created in step 1'); 
		_gaq.push(['_trackEvent', 'Install', 'Fail']);
	},
	
	handleInstall: function() {
		// we don't actually know that the bookmarklett was installed, but we're just going to pretend it was
		_gaq.push(['_trackEvent', 'Install', 'Success']);
	}

});

new Bookmarklett({el: $('#bookmarklett')});


