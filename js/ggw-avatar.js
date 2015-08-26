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

/* ==========================================================================
	 Volunteers Widget
   ========================================================================== */
$.ggw.volunteers = function(el, config, param) {

	// To avoid scope issues, use 'base' instead of 'this'
	// to reference this class from internal events and functions.
	var base = this;

	// Access to jQuery and DOM versions of element
	base.$el = $(el);
	base.el = el;

	// Configuration
	// we merge the default and the given data using 'deep' extend feature
	// see. http://api.jquery.com/jQuery.extend/
	config = $.extend(true, {
		baseUrl	: 'https://greenwire.greenpeace.org/api/public/volunteers.json',
		parameters : 'domain=netherlands&page=1',
		maxdisplay: 20, // if 0 limit is used
		selector : {
			content	: '.block-content',
			volunteers : '.block-content ul',
			count	: '.counter .total',
			loading	: '.block-content .loading',
		},
		template : {
			members : '#volunteersTemplate',
			volunteersTotal : '#volunteersTotalTemplate',
			volunteer : '#volunteersListItemTemplate',
			error : '#errorTemplate'
		},
	}, config || {});

	// The plugin return itself
	// for it also may need to chain itself to stuffs to get things done
	return base.$el.each(function() {

		var response_pictures;
		var response_total;
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
			   param = config.parameters;
			}

			// check if the data are not already available
			// only make one Ajax/JSON call
			if (response_pictures === undefined) {
				$.ajax({
					url: config.baseUrl ,
					data : param + '&must_have_default_avatar=0&limit=12',
					dataType : 'json',
					xhrFields: {
						'withCredentials': true
					},
					success : function(data) {
						response_pictures = data;
						onVolunteersReady();
					},
					error : function() {
						onError('ajax');
					}
				});
			}

			// check if the data are not already available
			// only make one Ajax/JSON call
			if (response_total === undefined) {
				$.ajax({
					url: config.baseUrl,
					data : param + '&limit=1',
					dataType : 'json',
					xhrFields: {
						'withCredentials': true
					},
					success : function(data) {
						response_total = data;
						onTotalReady();
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
			if(response_pictures['header']['status'] === 'OK') {
				renderVolunteers();
			} else {
				onError('status');
			}
		}

		/**
		 * Post initialization callback
		 */
		function onTotalReady() {
			if(response_total['header']['status'] === 'OK') {
				renderTotal();
			} else {
				onError('status');
			}
		}

		/**
		 * Render the question template with some taky annimation
		 */
		function renderVolunteers() {
			$('.loading').css('display','none');

			// Render the volunteers template
			i = 0;
			v = response_pictures['body']['volunteers'];
			imax = config.maxdisplay;

			for (;i<imax;i++) {
				$(config.template.volunteer)
					.tmpl([{ avatar : v[i]['avatar']}])
					.appendTo(widget + config.selector.volunteers);
			}

		}

		function renderTotal() {
			// Render the total template
			$(config.template.volunteersTotal)
				.tmpl([{ total : response_total['header']['pagination']['total']}])
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
		init(this);
	});

};

})( jQuery );

/* ==========================================================================
	 MAIN
	 ========================================================================== */
/* volunteers widget */
$.ggw.volunteers('.js-ggw-volunteers', {
	//baseUrl : 'https://localhost/ggw_widgets/json/volunteers.json',
	//baseUrl	: 'https://greenwire-stage.greenpeace.org/api/public/volunteers.json',
	baseUrl	: 'https://greenwire.greenpeace.org/api/public/volunteers.json',
	//baseUrl : 'http://www.greenpeace.nl/Global/nederland/greenwire/json/volunteers.json',
	maxdisplay : 12
});
