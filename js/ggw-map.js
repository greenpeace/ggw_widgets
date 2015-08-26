/**
 * Greenpeace Greenwire - Upcoming events widget
 *
 * @copyright	 Copyright 2015, Greenpeace International
 * @license		 MIT License (opensource.org/licenses/MIT)
 */
;(function ( $ ) {

    /* set namespace */
    if (!$.ggw) {
        $.ggw = {};
    }

    /* ==========================================================================
     Event Widget
     ========================================================================== */
    $.ggw.eventsmap = function(el, config, param) {

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
            baseUrl	: 'https://greenwire.greenpeace.org/api/public/events.json',
            parameters : 'domain=netherlands&limit=20',
            maxdisplay: 0, // if 0 limit is used
            center: {  lat  : 51.3, long : 0.7 },
            maxzoom :12,
            minzoom : 1,
            startzoom : 6,
            selector : {
            },
            template : {
            }
        }, config || {});

        // The plugin return itself
        // for it also may need to chain itself to stuffs to get things done
        return base.$el.each(function() {
            // Variables
            var map;
            var response;

            function init(o) {
                // set up the map
                map = new L.Map($(o).attr('id'));

                // create the tile layer with correct attribution
                var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                var osmAttrib = 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
                var osm = new L.TileLayer(osmUrl, {
                    minZoom: config.minzoom, maxZoom: config.maxzoom, attribution: osmAttrib
                });

                // start the map in given latitude and longitude
                map.setView(new L.LatLng(config.center.lat,config.center.long), config.startzoom);
                map.addLayer(osm);

                // URL parameters can be defined in data extra or config
                param = $(o).attr('data-url-parameters')
                if (param === undefined) {
                    param = config.parameters;
                }

                // check if the data are not already available
                // only make one Ajax/JSON call
                if (response === undefined) {
                    $.ajax({
                        url: config.baseUrl + '?' + param,
                        dataType : 'json',
                        type : 'get',
                        xhrFields: {
                            withCredentials: true
                        },
                        success : function(data) {
                            response = data;
                            onEventsReady();
                        },
                        error : function() {
                            onError('ajax');
                        }
                    });
                } else {
                    onEventsReady();
                }

            }

            function onEventsReady() {
                e = response['body']['events'];
                imax = response['body']['events'].length;

                for (var i=0;i<imax;i++) {
                    var marker = L.marker([
                        e[i]['location']['coordinates']['latitude'],
                        e[i]['location']['coordinates']['longitude']
                    ]).addTo(map);
                }
            }

            // go widget
            init(this);
        });
    };

})( jQuery );

/* events widget */
$.ggw.eventsmap('#js-ggw-eventsmap', {
    // baseUrl : 'http://localhost/ggw_widgets/json/events.json'
    //baseUrl	: 'https://greenwire-stage.greenpeace.org/api/public/events.json',
    baseUrl	: 'https://greenwire.greenpeace.org/api/public/events.json',
    //baseUrl : 'http://www.greenpeace.nl/Global/nederland/greenwire/json/events.json'
    center : {
        lat : 52,
        long: 5
    },
    startzoom : 7
});
