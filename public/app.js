var PageRank = Backbone.Model.extend({
	collection: PageRanks,
	pagerank: undefined,
	timestamp: null,
	
	initialize: function(attrs, options) {
		this.timestamp = new Date();
		this.id = this.normalize(attrs.id);
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
	
	url: function() {
		return 'pagerank?url=' + this.id;
	},
	
	parse: function(response) {
		// response is already parsed to JSON by jQuery because of the content-type headers
		if (response.error) {
			throw response;
		}
		response.id = this.normalize(response.url);
		delete response.url;
		return response;
	}
});

var PageRanks = Backbone.Collection.extend({
	model: PageRank,
	
	get: function(id) {
		return Backbone.Collection.prototype.get.call(this, PageRank.prototype.normalize('' + id));
	}
});

// todo: store results in localStorage and initialize from there
var pageRanks = new PageRanks([]);

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
	
	initialize: function() {
    	this.list = this.$('ul');
    	
    	this.listenTo(this.collection, 'add', this.addOne);
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
    	this.list.append(view.render().el);
	}
});

new ResultsList({el: $('#results'), collection: pageRanks});

var FormView = Backbone.View.extend({
	events: {
		"click button": "lookup"
	},
	input: null,
	
	initialize: function() {
		this.input = this.$('input');
	},
	
	lookup: function(event) {
		event.preventDefault();
		var id = this.input.val();
		var pr = pageRanks.get(id)
		if (pr) {
			pr.trigger('flash', 3);
		} else {
			pr = new PageRank({id: id});
			pr.fetch();
			pageRanks.add(pr);
		}
	}
});

new FormView({el: $('#lookup-form')});