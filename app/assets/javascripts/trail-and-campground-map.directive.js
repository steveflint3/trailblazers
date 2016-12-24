(function() {
    'use strict';

    angular.module('trailblazer')
    .directive('tandcmap', TrailandCampgroundMapDirective);

    TrailandCampgroundMapDirective.$inject = ['$stateParams'];

    /**
     * Creates Directive for OpenLayers Map Element
     * @param {Service} MapService Angular Service used for http request from map data
     * @return {Object} Directive config and map setup and event functionality
     */
    function TrailandCampgroundMapDirective($stateParams) {
        return {
            restrict: 'EA',
            scope: {
                dataTitle: '=',
            },
            link: setupMap
        };

        /**
         * Creates and runs event handling for OpenLayers map
         * @return {void}
         */
        function setupMap() {
            var element = 'map';
            var map;
            var vectorArray = [];
            //var source;
            var baseLayer;
            var campgroundMarkers = [];

            /**
             * Configs base Map layer with tiles sourced from MapBox
             * @return {Object} Vector layer used for map tileing
             */
            function buildBaseLayer() {
                baseLayer = new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmdhbGFudG93aWN6IiwiYSI6ImNpd3dsNmhyZjAxNWUydHFyNnhjbzZwc3QifQ._xkfHwZJ1FsueAu0K6oQeg'
                    })
                });
                return baseLayer;
            }

            /**
             * Builds rectangle layer for user select-radius functionality
             * @return {Object} rectangle vector layer compatible with map
             */
            function buildMarker(icons) {
                icons.forEach(function buildVector(icon) {
                    var vectorSource = new ol.source.Vector({
                        features: [icon]
                    });

                    var vector = new ol.layer.Vector({
                        source: vectorSource
                    });
                    vectorArray.push(vector);
                });
                return vectorArray;
            }


            /**
             * Constructs openLayers Map
             * @param  {Object} baseLayer MapBox tiles
             * @param  {Object} vector    Rectangle radius vector object
             * @return {Object}           OpenLayers Map and configuration
             */
            function buildMap(baseLayer, vectors) {
                var mapLayers = baseLayer.concat(vectors);
                console.log(mapLayers);
                map = new ol.Map({
                    target: element,
                    controls: ol.control.defaults(),
                    renderer: 'canvas',
                    layers: mapLayers,
                    view: new ol.View({
                        center: centerMap($stateParams.centerCoords),
                        zoom: 12,
                        maxZoom: 18,
                        minZoom: 2
                    })
                });
                return map;
            }

            function addCampgroundMarkers(coordinates) {
               var iconFeature = new ol.Feature({
                    geometry: new ol.geom.Point(coordinates),
                    name: 'Camping',
                });

                var iconStyle = new ol.style.Style({
                    image: new ol.style.Icon(({
                        anchor: [0.5, 46],
                        anchorXUnits: 'fraction',
                        anchorYUnits: 'pixels',
                        src: 'images/tent-icon.png',
                        scale: 0.05
                    }))
                });

                iconFeature.setStyle(iconStyle);
                campgroundMarkers.push(iconFeature);
            }

            function centerMap(coordinates) {
                if (!coordinates) {
                    return;
                }
                var coordArray = coordinates;
                var eastWest = (coordArray[0]-((coordArray[0]-coordArray[2])/2));
                var northSouth = (coordArray[1]-((coordArray[1]-coordArray[3])/2));
                var center = [ eastWest, northSouth ];
                return center;
            }

            function findCampgrounds() {
                console.log('running', $stateParams);
                if (!$stateParams.campgrounds) {
                    return;
                }
                else {
                    var campgrounds = $stateParams.camprounds;
                    console.log(campgrounds);
                    campgrounds.forEach(function markAndPlotCampgrounds(campground) {
                        addCampgroundMarkers(centerMap(campground));
                    });
                    buildMap(buildBaseLayer(), buildMarker(campgroundMarkers));
                    window.clearInterval(waitForMarkerData);
                }
            }

            var waitForMarkerData = window.setInterval(findCampgrounds,5000);
        }
    }
}());
