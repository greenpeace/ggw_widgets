/**
 * Greenpeace Greenwire
 * @package		 org.greenpeace.greenwire.js.ggw
 * @copyright	 Copyright 2013, Greenpeace International
 * @license		 MIT License (opensource.org/licenses/MIT)
 */
$.fn.ggw = (function(config) {

	// Configuration
	// we merge the default and the given data using 'deep' extend feature
	// see. http://api.jquery.com/jQuery.extend/
	config = $.extend(true, {
		baseUrl	: 'http://greenwire.greenpeace.org/api/public/',
		dataUrl : 'volunteers.json?domain=netherlands&limit=70',
		selector : {
			//container : '', // automatically set @see init
			content	: '.block-content',
			volunteers : '.block-content ul',
			count	: '.counter .total',
			loading	: '.block-content .loading',
		},
		template : {
			members : '#volunteersTemplate',
			volunteersTotal : '#volunteersTotalTemplate',
			volunteersAvatar : '#volunteersAvatarTemplate'
		},
	}, config || {});

	// The plugin return itself 
	// for it also may need to chain itself to stuffs to get things done
	return this.each(function() {

		var id;
		var volunteers;

		/**
		 * Initialization method
		 * Load the data and get the party started
		 * @param string , the application id
		 */
		function init(o) {
			id = o;
			config.selector.container = '#' + id;
			// check if the data are not already available
			// only make one Ajax/JSON call 
			if (volunteers === undefined) {
				$.getJSON(
					config.baseUrl + config.dataUrl,
					function(data) {
						volunteers = data[0];
						onVolunteersReady();
					}
				);
			} else {
				// reset with previous data
				onVolunteersReady();
			}
		}

		/**
		 * Post initialization callback
		 */
		function onVolunteersReady() {
			if(volunteers['header']['status'] === 'OK') {
				renderVolunteers();
			}
		}

		/**
		 * Render the question template with some taky annimation
		 */
		function renderVolunteers() {
			$('.loading').css('display','none');

			// Render the volunteers template
			i = 0;
			v = volunteers['body']['volunteers'];
			vmax = volunteers['body']['volunteers'].length;
			for (;i<vmax;i++) {
				if(v[i]['avatar'] != null) {
					$(config.template.volunteersAvatar)
						.tmpl([{ avatar : v[i]['avatar']}])
						.appendTo(config.selector.volunteers);
				}
			}

			// Render the total template
			$(config.template.volunteersTotal)
				.tmpl([{ total : volunteers['header']['pagination']['total']}])
				.appendTo(config.selector.content);

		}

		// Go widget, give them hell!
		init(this.id);
	});
});

/* MAIN */
$('#js-ggw-volunteers').ggw({
	baseUrl : 'http://localhost/ggw_widgets/json/',
	dataUrl : 'volunteers.json'
});
