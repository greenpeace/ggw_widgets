/**
 * Greenpeace Greenwire
 * @package		 org.greenpeace.greenwire.js.ggw
 * @copyright	 Copyright 2013, Greenpeace International
 * @license		 MIT License (opensource.org/licenses/MIT)
 */
;(function ( $ ) {

/* set namespace */
if (!$.ggw) {
	$.ggw = {};
};

/* volunteers widget */
$.ggw.volunteers = function(el, config, param) {

	// To avoid scope issues, use 'base' instead of 'this'
	// to reference this class from internal events and functions.
	var base = this;

	// Access to jQuery and DOM versions of element
	base.$el = $(el);
	base.el = el;

	// Add a reverse reference to the DOM object
	//base.$el.data( "ggw.volunteers" , base);

	// Configuration
	// we merge the default and the given data using 'deep' extend feature
	// see. http://api.jquery.com/jQuery.extend/
	config = $.extend(true, {
		baseUrl	: 'https://greenwire.greenpeace.org/api/public/volunteers.json',
		paramaters : '?domain=netherlands&limit=70',
		selector : {
			content	: '.block-content',
			volunteers : '.block-content ul',
			count	: '.counter .total',
			loading	: '.block-content .loading',
		},
		template : {
			members : '#volunteersTemplate',
			volunteersTotal : '#volunteersTotalTemplate',
			volunteersAvatar : '#volunteersAvatarTemplate',
			error : '#errorTemplate'
		},
	}, config || {});

	// The plugin return itself 
	// for it also may need to chain itself to stuffs to get things done
	return base.$el.each(function() {

		var response;
		var widget;

		/**
		 * Initialization method
		 * Load the data and get the party started
		 * @param o, object the dom object
		 */
		function init(o) {
			widget = "#" + $(o).attr('id') + " ";
			param = $(o).attr('data-url-parameters')
			if (param === undefined) {
			   param = config.paramaters;
			}

			// check if the data are not already available
			// only make one Ajax/JSON call 
			if (response === undefined) {
				$.ajax({
					url: config.baseUrl + '?' + param,
					dataType : 'json',
					xhrFields: {
						withCredentials: true
					},
					success : function(data) {
						response = data[0];
						onVolunteersReady();
					},
					error : function() {
						onError('ajax');
					}
				});
			}
		}

		/**
		 * Post initialization callback
		 */
		function onVolunteersReady() { 
			if(response['header']['status'] === 'OK') {
				renderVolunteers();
			} else {
				onError('status');
			}
		}http://localhost/ggw_widgets/volunteers.html

		/**
		 * Render the question template with some taky annimation
		 */
		function renderVolunteers() {
			$('.loading').css('display','none');

			// Render the volunteers template
			i = 0;
			v = response['body']['volunteers'];
			vmax = response['body']['volunteers'].length;
			for (;i<vmax;i++) {
				if(v[i]['avatar'] != null) {
					$(config.template.volunteersAvatar)
						.tmpl([{ avatar : v[i]['avatar']}])
						.appendTo(widget + config.selector.volunteers);
				}
			}

			// Render the total template
			$(config.template.volunteersTotal)
				.tmpl([{ total : response['header']['pagination']['total']}])
				.appendTo(widget + config.selector.content);

		}

		function onError(code) {
			renderError();
		}

		function renderError() {
			$(config.selector.volunteers).css('display','none');
			$('.loading').css('display','none');

			// Render the total template
			$(config.template.error)
				.tmpl()
				.appendTo(widget + config.selector.content);

		}

		// Go widget, give them hell!
		//alert(this.id);
		init(this);
	});

};

})( jQuery );

/* MAIN */
/* volunteers widget */
$.ggw.volunteers('.js-ggw-volunteers', {
	baseUrl : 'http://localhost/ggw_widgets/json/volunteers-error.json'
});
