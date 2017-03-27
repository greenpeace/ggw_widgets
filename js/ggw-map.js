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
     Event Map Widget
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
            parameters : [{
                domain : 'netherlands',
                limit : 20
            }],
            center: {  lat  : 51.3, long : 0.7 },
            maxzoom :12,
            minzoom : 1,
            startzoom : 6,
            selector : {
            },
            template : {
                markerpopup : "#popupItemTemplate"
            },
            icons : {
                events : { // see http://leafletjs.com/examples/custom-icons.html
                    iconUrl: 'https://greenwire.greenpeace.org/sites/all/themes/ggw_int/images/map/marker-icon.png',
                    shadowUrl: '',
                    iconSize: [25, 41],
                    popupAnchor: [0, -10]
                }
            }
        }, config || {});

        // The plugin return itself
        // for it also may need to chain itself to stuffs to get things done
        return base.$el.each(function() {
            // Variables
            var map;
            var response;
            var clusters = [];

            function init(o) {
                onInitMap(o);

                // URL parameters can be defined in data extra or config
                param = $(o).attr('data-url-parameters')
                if (param === undefined) {
                    param = config.parameters;
                }

                // for each countries
                for (var i = 0; i < param.length ; i++) {

                    // build the query string
                    var p;
                    var done = 0;

                    if (typeof(param[i]) === 'object') {
                        p = $.param(param[i]);
                    }

                    // query the url
                    $.ajax({
                        url: config.baseUrl + '?' + p,
                        dataType : 'json',
                        type : 'get',
                        xhrFields: {
                            withCredentials: true
                        },
                        success : function(data) {
                            response = data;
                            done++;
                            if(response['body']['events'] != undefined) {
                                onEventsReady(response['body']['events']);
                            } else {
                                if(response['body']['groups'] != undefined) {
                                    onGroupsReady(response['body']['groups']);
                                }
                                //console.log('undefined for:' + done);
                            }
                            if(done == param.length) {
                                onAllEventsReady();
                            }
                        },
                        error : function() {
                            onError('ajax');
                        }
                    });
                }
            }

            function onInitMap(o) {
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

                // build the cluster groups
                clusters['events'] = new L.MarkerClusterGroup();
                map.addLayer(clusters['events']);
            }

            function onEventsReady(e) {
                imax = e.length;
                var tmpl = $.templates(config.template.markerpopup);
                var eventIcon = L.icon(config.icons.events);
                for (var i=0; i<imax; i++) {
                    e[i]['friendly_date'] = moment(e[i]['start_date']).fromNow();
                    var grps = e[i]['groups'];
                    grps = grps[Object.keys(grps)[0]].domain;
                    e[i]['domain'] = grps;
                    e[i]['picture']=e[i]['picture'].replace('avatar',"extra_large");
                    clusters['events'].addLayer(new L.marker([
                            e[i]['location']['coordinates']['latitude'],
                            e[i]['location']['coordinates']['longitude']
                        ], {icon: eventIcon})
                        .bindPopup(tmpl(e[i]))
                    );
                }
            }
            function onGroupsReady(e) {
                imax = e.length;
                var tmpl = $.templates(config.template.markerpopup);
                var eventIcon = L.icon(config.icons.events);
                for (var i=0; i<imax; i++) {
                    e[i]['friendly_date'] = moment(e[i]['start_date']).fromNow();
                    clusters['groups'].addLayer(new L.marker([
                          e[i]['location']['coordinates']['latitude'],
                          e[i]['location']['coordinates']['longitude']
                      ], {icon: eventIcon})
                        .bindPopup(tmpl(e[i]))
                    );
                }
            }

            function onAllEventsReady() {
                //console.log('alleventready');
            }

            function onError(type) {
                switch (type) {
                    case 'ajax' :
                        // oops something went wrong network wise
                        break;
                }
            }

            // go widget
            init(this);
        });
    };

})( jQuery );
//
///* events widget EXAMPLE */
//$.ggw.eventsmap('#js-ggw-eventsmap', {
//    baseUrl	: 'https://greenwire.greenpeace.org/api/public/events.json',
//    center : {
//        lat : 52,
//        long: 5
//    },
//    center: {  lat  : 0, long : 0 },
//    maxzoom :12,
//    minzoom : 1,
//    startzoom : 2,
//    parameters : [{
//            domain : 'netherlands'
//        },{
//            domain : 'thailand'
//        },{
//            domain : 'belgium'
//        },{
//            domain : 'russia'
//        },{
//            domain : 'brazil'
//        },{
//            domain : 'new-zealand'
//        },{
//            domain : 'nordic'
//        },{
//            domain : 'usa'
//        },{
//            domain : 'uk'
//        },{
//            domain : 'india'
//        },{
//            domain : 'africa'
//        },{
//            domain : 'canada'
//        },{
//            domain : 'mexico'
//        },{
//            domain : 'indonesia'
//    }]
//});
