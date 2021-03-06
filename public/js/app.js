(function() {
    'use strict';

    angular.module('trailblazer', [  'openlayers-directive', 'ngSanitize', 'ui.router', 'ngFileUpload' ])
        .config(viewConfig);

    viewConfig.$inject = [ '$stateProvider', '$locationProvider', '$urlRouterProvider' ];

    function viewConfig($stateProvider, $locationProvider, $urlRouterProvider) {

       $urlRouterProvider.when('', '/');
       $locationProvider.hashPrefix('');

       $stateProvider
       .state({
           name: 'home',
           url: '/',
           templateUrl: 'templates/home.template.html',
           params: {
               token: null
           }
       })
       .state({
           name: 'trails-and-campgrounds',
           url: '/trails-and-campgrounds',
           templateUrl: 'templates/trails-and-campgrounds.template.html',
           controller: 'TrailandCampgroundController',
           controllerAs: 'TandC',
           params: {
               user_token: null,
               centerCoords: null,
               trails: null,
               campgrounds: null
           }
       })
       .state({
           name: 'buffer',
           url: '/buffering',
           templateUrl: 'templates/buffering.template.html',
           controller: 'RadiusSearchController',
           controllerAs: 'buffer',
           params: {
               transCoords: null,
               centerCoords: null
           }
       })
       .state({
           name: 'signin',
           url: '/signin',
           templateUrl: 'templates/signin.template.html',
           controller: 'SigninController',
           controllerAs: 'signin'
       })
       .state({
           name: 'trip',
           url: '/trip-summary/:id',
           templateUrl: 'templates/trip-summary.template.html',
           controller: 'TripSummaryController',
           controllerAs: 'tripSum',
           params: {
               id: null,
               trip: null,
           }
       });
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .controller('NavController', NavController);

    NavController.inject = ['$timeout', '$rootScope', '$state', 'TrailandCampgroundService'];

    function NavController($timeout, $rootScope, $state, TrailandCampgroundService) {
        var vm = this;
        vm.signedIn = null;
        vm.searched = null;
        vm.hasSearched = null;
        vm.searchValues = {};

        vm.submitSearch = function submitSearch(searchValues) {
            TrailandCampgroundService.findTsandCsSearchForm(searchValues)
                .then(function success(data) {
                    vm.searchValues = {};
                    $state.go('trails-and-campgrounds', {centerCoords: data.center, trails: data.trails, campgrounds: data.campgrounds });
                })
                .catch(function error(err){
                    console.log(err);
                });
        };

        $rootScope.$watch('user', function() {
            if($rootScope.user || JSON.parse(sessionStorage.getItem('user'))) {
                vm.signedIn = true;
            }
            else {
                vm.signedIn = null;
            }
        });

        vm.newSearch = function newSearch() {
            $rootScope.searched = null;
            $state.go('home');
        };

        $rootScope.$watch('searched', function() {
            if($rootScope.searched || JSON.parse(sessionStorage.getItem('TsandCs'))) {
                vm.hasSearched = true;
            } else {
                vm.hasSearched = null;
            }
        });
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .controller('RadiusSearchController', RadiusSearchController);

    RadiusSearchController.$inject = [ '$state', '$stateParams', '$rootScope', 'TrailandCampgroundService' ];

    function RadiusSearchController($state, $stateParams, $rootScope, TrailandCampgroundService) {
        var vm = this;
        vm.coordinates = $stateParams.transCoords;
        vm.trails = null;
        vm.campground = null;
        vm.getTandC = TrailandCampgroundService.findTsandCs(vm.coordinates)
            .then(function transformData(data) {
                vm.trails = data.trails;
                vm.campgrounds = data.campgrounds;
                //$rootScope.TsandCs = angular.toJson({trails: data.trails, campgrounds: data.campgrounds, centerCoords: $stateParams.centerCoords});
                sessionStorage.setItem('TsandCs', angular.toJson({trails: data.trails, campgrounds: data.campgrounds, centerCoords: $stateParams.centerCoords, transCoords: $stateParams.transCoords}));
            })
            .catch(function errHandler(err) {
                console.log(err);
            });

        vm.noSignin = function noSignin() {
            $state.go('trails-and-campgrounds', {centerCoords: $stateParams.centerCoords, trails: vm.trails, campgrounds: vm.campgrounds });
        };

        vm.signin = function signin() {
            $state.go('signin');
        };

    }

}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .controller('SigninController', SigninController);

    SigninController.$inject = [ '$state', '$rootScope', 'Upload', 'UserService' ];

    function SigninController( $state, $rootScope, Upload, UserService ){
        var vm = this;
        vm.user = {};
        vm.userCreate = false;
        vm.message = null;
        vm.avatar = null;
        vm.avatarUrl = null;

        vm.convertAvatar = function convertAvatar(avatar) {
            Upload.base64DataUrl(avatar).then(function(url){
                vm.avatarUrl = url;
            });
        };

        vm.userAccount = function userAccount(user, img) {
            if (!img) {
            UserService.signinUser(user)
                .then( function success(data) {
                    if(data.error){
                        vm.message = data.error;
                        return;
                    } else if (!$rootScope.searched) {
                        $state.go('home', {token: data.token});
                    } else {
                        sessionStorage.setItem('userToken', angular.toJson(data.token));
                        $state.go('trails-and-campgrounds', {
                            user_token: data.token,
                            centerCoords: JSON.parse(sessionStorage.getItem('TsandCs')).centerCoords,
                            trails: JSON.parse(sessionStorage.getItem('TsandCs')).trails,
                            campgrounds: JSON.parse(sessionStorage.getItem('TsandCs')).campgrounds,
                        });
                    }
                })
                .catch( function error(err) {
                    console.log(err);
                });
                vm.user = {};
                vm.userCreate = false;
            } else {
                UserService.createUser(user, img)
                    .then( function success(data) {
                        if(data.error){
                            vm.message = data.error;
                            return;
                        } else if (!$rootScope.searched) {
                            $state.go('home');
                        } else {
                            sessionStorage.setItem('userToken', angular.toJson(data.token));
                            $state.go('trails-and-campgrounds', {
                                user_token: data.token,
                                centerCoords: JSON.parse(sessionStorage.getItem('TsandCs')).centerCoords,
                                trails: JSON.parse(sessionStorage.getItem('TsandCs')).trails,
                                campgrounds: JSON.parse(sessionStorage.getItem('TsandCs')).campgrounds,
                            });
                        }
                    })
                    .catch( function error(err) {
                        console.log(err);
                    });
            }
            vm.user = {};
            vm.userCreate = false;
        };

        vm.userCreateSwitch = function userCreateSwitch() {
            vm.userCreate = !vm.userCreate;
        };
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .controller('TrailandCampgroundController', TrailandCampgroundController);

    TrailandCampgroundController.$inject = ['$scope', '$stateParams', '$rootScope', 'TripService'];

    function TrailandCampgroundController($scope, $stateParams, $rootScope, TripService) {
        var vm = this;

        vm.trails = $stateParams.trails || JSON.parse(sessionStorage.getItem('TsandCs')).trails;
        vm.campgrounds = $stateParams.campgrounds || JSON.parse(sessionStorage.getItem('TsandCs')).campgrounds;
        vm.center = $stateParams.centerCoords || JSON.parse(sessionStorage.getItem('TsandCs')).centerCoords;
        vm.element = null;
        vm.markerElement = null;

        vm.trailPopup = function trailPopup(element){
            vm.element = element;
        };

        vm.addTrip = function addTrip(tripItem) {
            TripService.addTorCtoTrip(tripItem);
        };

        vm.addMapClickedPopup = function addMapClickedPopup() {
            TripService.addMapClickedPopup();
        };
    }

}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .controller('TripSummaryController', TripSummaryController);

    TripSummaryController.$inject = ['$stateParams'];

    function TripSummaryController($stateParams) {
        var vm = this;

        vm.trip = $stateParams.trip ||  JSON.parse(sessionStorage.getItem('trip'));

    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .controller('TripController', TripController);

    TripController.$inject = [ '$scope', '$state', '$rootScope', 'TrailandCampgroundService', 'TripService' ];

    function TripController($scope, $state, $rootScope, TrailandCampgroundService, TripService) {
        var vm = this;
        vm.trip = {};
        vm.tsORcs = TripService.tsORcs;
        vm.madeSearch = null;
        vm.searchValues = {};

        vm.submitSearch = function submitSearch(searchValues) {
            TrailandCampgroundService.findTsandCsSearchForm(searchValues)
                .then(function success(data) {
                    vm.searchValues = {};
                    $state.go('trails-and-campgrounds', {trails: data.trails, campgrounds: data.campgrounds });
                })
                .catch(function error(err){
                    console.log(err);
                });
        };

        vm.postTrip = function postTrip(trip) {
            TripService.postTrip(trip)
            .then(function success(data) {
                vm.tsORcs = TripService.clearTsorCs();
                vm.trip = {};
                $state.go('trip', {id: data.trip.id, trip:data});
            });
        };

        vm.newSearch = function newSearch() {
            vm.tsORcs = TripService.clearTsorCs();
            $rootScope.searched =  null;
            $state.go('home');
        };

        $rootScope.$watch('searched', function() {
            if($rootScope.searched   || JSON.parse(sessionStorage.getItem('TsandCs'))) {
                vm.madeSearch = true;
            } else {
                vm.madeSearch = false;
            }
        });

    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .controller('UserProfileController', UserProfileController);

    UserProfileController.$inject = [  '$scope', '$state', '$rootScope', 'Upload', 'UserService' ];

    function UserProfileController($scope, $state, $rootScope, Upload, UserService) {
        var vm = this;
        vm.user = JSON.parse(sessionStorage.getItem('user'));
        vm.signedIn = null;
        vm.avatar = null;

        if (vm.user) {
            vm.avatar = Upload.dataUrltoBlob(vm.user.profile_image, 'prof');
        }

        vm.signOff = function signOff() {
            UserService.signoffUser()
            .then(function success() {
                $state.go('home');
            })
            .catch(function error(err) {
                console.log(err);
            });
        };

        $rootScope.$watch('user', function() {
            if($rootScope.user || JSON.parse(sessionStorage.getItem('user'))) {
                vm.signedIn = true;
                vm.user = JSON.parse(sessionStorage.getItem('user'));
                vm.avatar = Upload.dataUrltoBlob(vm.user.profile_image, 'prof');
            }
            else {
                vm.signedIn = null;
            }
        });
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
    .directive('map', MapDirective);

    MapDirective.$inject = [ '$state', '$rootScope', 'TrailandCampgroundService' ];

    /**
     * Creates Directive for OpenLayers Map Element
     * @param {Service} MapService Angular Service used for http request from map data
     * @return {Object} Directive config and map setup and event functionality
     */
    function MapDirective($state, $rootScope, TrailandCampgroundService) {
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
            var vector = buildRectangle();
            var map = buildMap(buildBaseLayer(), vector, element);
            var draw = new ol.interaction.Draw({
                source: new ol.source.Vector({wrapX: false}),
                type: 'Circle',
                geometryFunction: ol.interaction.Draw.createBox(),
                style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: '#ffdd55',
                        width: 2
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 290, 0, 0.4)'
                    }),
                    image: new ol.style.Icon({
                        scale: 0.15,
                        src: 'images/trailhead.png'
                    })
                })
            });

            if ( ($(window).width()) < 480) {
                $('#map')[0].style.display = 'none';
            }

            sessionStorage.removeItem('TsandCs');

            $rootScope.searched = null;

            function removeNotice() {
                $('#data-notice').css('display', 'none');
                $rootScope.notice = true;
            }
            if ($rootScope.notice) {
                $('#data-notice').css('display', 'none');
            } else {
                setTimeout(function(){removeNotice();}, 12000);
            }


            map.getView().on('change:resolution', function setRaduisBox() {
                if (map.getView().getZoom() > 7.5) {
                        $('map').css('cursor','none');
                        map.addInteraction(draw);
                    }
            });

            draw.on('drawend',function(e){
                var coordArray = e.feature.getGeometry().v;
                var transCoordOne = ol.proj.transform([ coordArray[0], coordArray[1]], 'EPSG:3857', 'EPSG:4326');
                var transCoordTwo = ol.proj.transform([ coordArray[2], coordArray[3]], 'EPSG:3857', 'EPSG:4326');
                var coordinates = transCoordOne.concat(transCoordTwo);
                if ($rootScope.user) {
                    TrailandCampgroundService.findTsandCs(coordinates)
                        .then(function success(data) {
                            sessionStorage.setItem('TsandCs', angular.toJson({trails: data.trails, campgrounds: data.campgrounds, centerCoords: coordArray, transCoords: coordinates}));
                            $rootScope.searched = true;
                            $state.go('trails-and-campgrounds', {
                                trails: data.trails,
                                campgrounds: data.campgrounds,
                                centerCoords: coordArray,
                                user_token: JSON.parse(sessionStorage.getItem('user')).token
                            });
                        })
                        .catch(function error(err) {
                            console.log(err);
                        });
                } else {
                    $state.go('buffer', {transCoords: coordinates, centerCoords: coordArray});
                }
            });
        }

        /**
         * Configs base Map layer with tiles sourced from MapBox
         * @return {Object} Vector layer used for map tileing
         */
        function buildBaseLayer() {
            var baseLayer = new ol.layer.Tile({
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
        function buildRectangle() {
            var vector;
            var source = new ol.source.Vector({wrapX: false});

            vector = new ol.layer.Vector({
                source: source
            });
            return vector;
        }

        /**
         * Constructs openLayers Map
         * @param  {Object} baseLayer MapBox tiles
         * @param  {Object} vector    Rectangle radius vector object
         * @return {Object}           OpenLayers Map and configuration
         */
        function buildMap(baseLayer, vector, element) {
            var center = [ -12053463.910959221, 4789639.227729736 ];
            if ( ($(window).width()) < 1000) {
                center = [ -10853463.910959221, 4789639.227729736 ];
            }
            var map = new ol.Map({
                target: element,
                controls: ol.control.defaults(),
                renderer: 'canvas',
                layers: [baseLayer, vector],
                view: new ol.View({
                    center: center,
                    zoom: 4,
                    maxZoom: 18,
                    minZoom: 2
                })
            });
            return map;
        }

    }

}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .directive('tandcmap', TrailandCampgroundMapDirective);

    TrailandCampgroundMapDirective.$inject = ['$stateParams', '$rootScope', 'TripService'];

    /**
     * Creates Directive for OpenLayers Map Element
     * @param {Service} MapService Angular Service used for http request from map data
     * @return {Object} Directive config and map setup and event functionality
     */
    function TrailandCampgroundMapDirective($stateParams, $rootScope, TripService) {
        var campgroundMarkers = [];
        var trailheadMarkers = [];
        var trailLineLayers = [];

        return {
            restrict: 'EA',
            scope: {
                popupelm: '@',
                popupelmClicked: '@',
                trails: '@',
                campgrounds: '@',
                center: '@',
            },
            link: setupMap
        };

        /**
         * Creates and runs event handling for OpenLayers map
         * @return {void}
         */
        function setupMap($scope) {
            var element = 'map';
            var map;
            var popupOverlay = new ol.Overlay({
               element: $('#popup')[0]
            });
            var markerClickedPopup = new ol.Overlay({
                element: $('#mapClicked-popup')[0]
            });

            if ( ($(window).width()) < 480) {
                $('#map')[0].style.display = 'block';
            }

            if (JSON.parse(sessionStorage.getItem('user'))) {
                $rootScope.user = true;
            }

            /**
             * Constructs openLayers Map
             * @param  {Object} baseLayer MapBox tiles
             * @param  {Object} campgroundVectors campground markers as openlayers vector layers
             * @param  {Object} trailheadVectors trailhead markers as openlayers vector layers
             * @param  {Object} trailLineVectors openlayers line vector layers representing trails
             * @return {Object}           OpenLayers Map and configuration
             */
            function buildMap(baseLayer, campgroundVectors, trailheadVectors, trailLineVectors) {
                trailheadVectors.unshift(baseLayer);
                var vectorLayers = trailheadVectors.concat(trailLineVectors, campgroundVectors);
                var builtMap = new ol.Map({
                    target: element,
                    controls: ol.control.defaults(),
                    renderer: 'canvas',
                    layers: vectorLayers,
                    overlays: [popupOverlay, markerClickedPopup],
                    view: new ol.View({
                        center: centerLayers(JSON.parse($scope.center)),
                        zoom: 9.5,
                        maxZoom: 20,
                        minZoom: 2
                    })
                });
                return builtMap;
            }

            /**
             * transforms resolved ajaxed data passed via StateParams to pass into
             * configuration functions.  Used by setInterval to wait for stateParams data
             * @return {void}
             */
            function findCampgroundsAndTrails() {
                if ($scope.campgrounds.length === 0 && $scope.campgrounds.length === 0) {
                    return;
                }
                else {
                    var campgrounds = JSON.parse($scope.campgrounds);
                    campgrounds.forEach(function markAndPlotCampgrounds(campground) {
                        var campgroundCoord = [campground.longitude, campground.latitude];
                        addCampgroundMarkers(centerLayers(campgroundCoord), campground.name, 'campground', campground);
                    });
                    var trails = JSON.parse($scope.trails);
                    trails.forEach( function markAndPlottrails(trail){
                        var trailCoordinates = [];
                        var trailheadCoord = ([ Number(trail.head_lon), Number(trail.head_lat) ]);
                        addTrailheadMarkers(centerLayers(trailheadCoord), trail.name, 'trail', trail);
                        trail.line.forEach(function plotTrail(trailNode){
                            var transformTrailNode = ol.proj.fromLonLat([ Number(trailNode.lon), Number(trailNode.lat) ]);
                            trailCoordinates.push(transformTrailNode);
                        });
                        createTrailLayers(trailCoordinates);
                    });
                    window.clearInterval(waitForMarkerData);
                    // trailheadMarkers = checkDupTrailheads(trailheadMarkers);
                    map = buildMap(buildBaseLayer(), buildMarker(campgroundMarkers), buildMarker(trailheadMarkers), buildMarker(trailLineLayers));
                    markerClick();
                }
            }

            var waitForMarkerData = window.setInterval(findCampgroundsAndTrails,100);

            $scope.$watch('popupelm', function(){
                if ($scope.popupelm === '') {
                    return;
                } else {
                    var tORcObj = JSON.parse($scope.popupelm);
                    var trailCoordinates = ol.proj.fromLonLat([tORcObj.longitude, tORcObj.latitude]);
                    if (tORcObj.campground_type) {
                        $('#popup .popup-content').html(
                            '<p>' + tORcObj.name + '<p>'
                        );
                    } else {
                        $('#popup .popup-content').html(
                            '<p>' + tORcObj.name + '<p>' +
                            '<p>Length: ' + Math.round(Number(tORcObj.length)*10)/10 + ' miles<p>'
                        );
                    }
                    map.getView().animate({zoom: 12}, {center: trailCoordinates});
                    popupOverlay.setPosition(trailCoordinates);
                    markerClickedPopup.setPosition(undefined);
                }
            });

            function markerClick() {
                map.on('click', function(evt) {
                    var feature = map.forEachFeatureAtPixel(evt.pixel,
                        function(feature) {
                            return feature;
                        });
                        if (feature) {
                            var geometry = feature.getGeometry();
                            var coord = geometry.getCoordinates();
                            if (feature.get('name') === 'TrailLine') {
                                return;
                            } else if (feature.get('type') === 'trail') {
                                geometry = feature.getGeometry();
                                coord = geometry.getCoordinates();
                                $('#mapClicked-popup .popup-content').html(
                                    '<p>' + feature.get('name') + '</p>' +
                                    '<p>' + Math.round(Number(feature.get('data').length)*10)/10 + ' miles</p>'
                                );
                            } else {
                                geometry = feature.getGeometry();
                                coord = geometry.getCoordinates();
                                $('#mapClicked-popup .popup-content').html(
                                    '<p>' + feature.get('name') + '</p>'
                                );
                            }
                            TripService.mapClickedpopup(feature.get('data'));
                            map.getView().animate({zoom: 12}, {center: coord});
                            markerClickedPopup.setPosition(coord);
                            popupOverlay.setPosition(undefined);
                        }
                });
            }
        }

        /**
         * Configs base Map layer with tiles sourced from MapBox
         * @return {Object} Vector layer used for map tileing
         */
        function buildBaseLayer() {
            var baseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmdhbGFudG93aWN6IiwiYSI6ImNpd3dsNmhyZjAxNWUydHFyNnhjbzZwc3QifQ._xkfHwZJ1FsueAu0K6oQeg'
                })
            });
            return baseLayer;
        }

        /**
         * Builds rectangle layer for user select-radius functionality
         * @param {Object} icons OpenLayers Feature used to build map vector layer
         * @return {Object} rectangle vector layer compatible with map
         */
        function buildMarker(icons) {
            var vectorArray = [];
            icons.forEach(function buildVector(icon) {
                var vectorSource = new ol.source.Vector({
                    features: [icon]
                });
                var vector = new ol.layer.Vector({
                    source: vectorSource,
                    zIndex: setZIndex(icon)
                    });

            vectorArray.push(vector);
            });
            return vectorArray;
        }

        /**
         * sets Zindex for map layers based off marker type
         * @param {Object} icon OpenLayers Feature used to build map vector layer
         */
        function setZIndex(icon) {
            if (icon.H.type === 'trail' || icon.H.type === 'campground') {
                return 2;
            } else {
                return 0;
            }
        }

        /**
         * creates campground markers as open layer feautures
         * @param {coordinates} coordinates geo coordinates for placement of
         * markers on map
         */
        function addCampgroundMarkers(coordinates, name, type, data) {
           var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(coordinates),
                name: name,
                type: type,
                data: data
            });

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'images/tent-icon.png',
                    scale: 0.075
                })
            });

            iconFeature.setStyle(iconStyle);
            campgroundMarkers.push(iconFeature);
        }

        /**
         * creates trailhead markers as open layer feautures
         * @param {coordinates} coordinates geo coordinates for placement of
         * markers on map
         */
        function addTrailheadMarkers(coordinates, name, type, data) {
           var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(coordinates),
                name: name,
                type: type,
                data: data
            });

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'images/trailhead.png',
                    scale: 0.175
                }),
            });

            iconFeature.setStyle(iconStyle);
            trailheadMarkers.push(iconFeature);
        }

        /**
         * creates trail markers as open layer line feautures
         * @param {trails} trails array of geo coordinates for placement of
         * trails on map
         */
        function createTrailLayers(trails) {
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.LineString(trails),
                name: 'TrailLine'
            });

            var iconStyle = new ol.style.Style({
              stroke: new ol.style.Stroke({
                  color: [255, 255, 0, 0.6],
                  width: 12.5
              })
            });

            iconFeature.setStyle(iconStyle);
            trailLineLayers.push(iconFeature);
        }

        /**
         * creates center point for map on page load
         * @param {coordinates} coordinates geo coordinates for placement of
         * center on map
         */
        function centerLayers(coordinates) {
            if (!coordinates) {
                return;
            } else if (coordinates.length === 2) {
                var transformCoordOne = ol.proj.fromLonLat([ coordinates[0], coordinates[1]]);
                var transformCoordTwo = ol.proj.fromLonLat([( coordinates[0] + 0.005), ( coordinates[1] + 0.005 )]);
                var markCoordinates = transformCoordOne.concat(transformCoordTwo);
                return markCoordinates;
            }
            var coordArray = coordinates;
            var eastWest = (coordArray[0]-((coordArray[0]-coordArray[2])/2));
            var northSouth = (coordArray[1]-((coordArray[1]-coordArray[3])/2));
            var center = [ eastWest, northSouth ];

            return center;
        }
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .directive('trip', TripSummaryDirective);

    TripSummaryDirective.$inject = [];

    /**
     * Creates Directive for OpenLayers Map Element
     * @param {Service} MapService Angular Service used for http request from map data
     * @return {Object} Directive config and map setup and event functionality
     */
    function TripSummaryDirective() {
        var campgroundMarkers = [];
        var trailheadMarkers = [];
        var trailLineLayers = [];

        return {
            restrict: 'E',
            scope: {
                tripData: '@',
            },
            link: setupMap
        };

        /**
         * Creates and runs event handling for OpenLayers map
         * @return {void}
         */
        function setupMap($scope) {
            var element = 'map';
            var map;
            var popupOverlay = new ol.Overlay({
                element: $('#popup')[0]
            });

            /**
             * Constructs openLayers Map
             * @param  {Object} baseLayer MapBox tiles
             * @param  {Object} campgroundVectors campground markers as openlayers vector layers
             * @param  {Object} trailheadVectors trailhead markers as openlayers vector layers
             * @param  {Object} trailLineVectors openlayers line vector layers representing trails
             * @return {Object}           OpenLayers Map and configuration
             */
            function buildMap(baseLayer, campgroundVectors, trailheadVectors, trailLineVectors) {
                trailheadVectors.unshift(baseLayer);
                var vectorLayers = trailheadVectors.concat(trailLineVectors, campgroundVectors);
                var builtMap = new ol.Map({
                    target: element,
                    controls: ol.control.defaults(),
                    renderer: 'canvas',
                    layers: vectorLayers,
                    overlays: [popupOverlay],
                    view: new ol.View({
                        center: centerLayers(JSON.parse(sessionStorage.getItem('TsandCs')).centerCoords),
                        zoom: 9.5,
                        maxZoom: 20,
                        minZoom: 2
                    })
                });
                return builtMap;
            }

            function findCampgroundsAndTrails() {
                if (!$scope.tripData) {
                    return;
                }
                else {
                    var campgrounds = JSON.parse($scope.tripData).trip.campgrounds;
                    campgrounds.forEach(function markAndPlotCampgrounds(campground) {
                        var campgroundCoord = [campground.longitude, campground.latitude];
                        addCampgroundMarkers(centerLayers(campgroundCoord), campground.name, 'campground', campground);
                    });
                    var trails = JSON.parse($scope.tripData).trails;
                    trails.forEach( function markAndPlottrails(trail){
                        var trailCoordinates = [];
                        var trailheadCoord = ([ Number(trail.head_lon), Number(trail.head_lat) ]);
                        addTrailheadMarkers(centerLayers(trailheadCoord), trail.name, 'trail', trail);
                        trail.line.forEach(function plotTrail(trailNode){
                            var transformTrailNode = ol.proj.fromLonLat([ Number(trailNode.lon), Number(trailNode.lat) ]);
                            trailCoordinates.push(transformTrailNode);
                        });
                        createTrailLayers(trailCoordinates);
                    });
                    window.clearInterval(waitForMarkerData);
                    map = buildMap(buildBaseLayer(), buildMarker(campgroundMarkers), buildMarker(trailheadMarkers), buildMarker(trailLineLayers));
                    markerClick();
                }
            }

            var waitForMarkerData = window.setInterval(findCampgroundsAndTrails,100);

            function markerClick() {
                map.on('click', function(evt) {
                    var feature = map.forEachFeatureAtPixel(evt.pixel,
                        function(feature) {
                            return feature;
                        });
                        if (feature) {
                            if (feature.get('name') === 'TrailLine') {
                                return;
                            }
                            var geometry = feature.getGeometry();
                            var coord = geometry.getCoordinates();
                            $('#popup .popup-content').html(
                                '<p>' + feature.get('name') + '</p>'
                            );
                            map.getView().animate({zoom: 12}, {center: coord});
                            popupOverlay.setPosition(coord);
                        }
                });
            }

        }

        /**
         * Configs base Map layer with tiles sourced from MapBox
         * @return {Object} Vector layer used for map tileing
         */
        function buildBaseLayer() {
            var baseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoibmdhbGFudG93aWN6IiwiYSI6ImNpd3dsNmhyZjAxNWUydHFyNnhjbzZwc3QifQ._xkfHwZJ1FsueAu0K6oQeg'
                })
            });
            return baseLayer;
        }

        /**
         * Builds rectangle layer for user select-radius functionality
         * @param {Object} icons OpenLayers Feature used to build map vector layer
         * @return {Object} rectangle vector layer compatible with map
         */
        function buildMarker(icons) {
            var vectorArray = [];
            icons.forEach(function buildVector(icon) {
                var vectorSource = new ol.source.Vector({
                    features: [icon]
                });
                var vector = new ol.layer.Vector({
                    source: vectorSource,
                    zIndex: setZIndex(icon)
                    });

            vectorArray.push(vector);
            });
            return vectorArray;
        }

        /**
         * sets Zindex for map layers based off marker type
         * @param {Object} icon OpenLayers Feature used to build map vector layer
         */
        function setZIndex(icon) {
            if (icon.H.type === 'trail' || icon.H.type === 'campground') {
                return 2;
            } else {
                return 0;
            }
        }

        /**
         * creates campground markers as open layer feautures
         * @param {coordinates} coordinates geo coordinates for placement of
         * markers on map
         */
        function addCampgroundMarkers(coordinates, name, type) {
           var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(coordinates),
                name: name,
                type: type
            });

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'images/tent-icon.png',
                    scale: 0.075
                })
            });

            iconFeature.setStyle(iconStyle);
            campgroundMarkers.push(iconFeature);
        }

        /**
         * creates trailhead markers as open layer feautures
         * @param {coordinates} coordinates geo coordinates for placement of
         * markers on map
         */
        function addTrailheadMarkers(coordinates, name, type) {
           var iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(coordinates),
                name: name,
                type: type
            });

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'images/trailhead.png',
                    scale: 0.175
                }),
            });

            iconFeature.setStyle(iconStyle);
            trailheadMarkers.push(iconFeature);
        }

        /**
         * creates trail markers as open layer line feautures
         * @param {trails} trails array of geo coordinates for placement of
         * trails on map
         */
        function createTrailLayers(trails) {
            var iconFeature = new ol.Feature({
                geometry: new ol.geom.LineString(trails),
                name: 'TrailLine'
            });

            var iconStyle = new ol.style.Style({
              stroke: new ol.style.Stroke({
                  color: [255, 255, 0, 0.6],
                  width: 12.5
              })
            });

            iconFeature.setStyle(iconStyle);
            trailLineLayers.push(iconFeature);
        }

        /**
         * creates center point for map on page load
         * @param {coordinates} coordinates geo coordinates for placement of
         * center on map
         */
        function centerLayers(coordinates) {
            if (!coordinates) {
                return;
            } else if (coordinates.length === 2) {
                var transformCoordOne = ol.proj.fromLonLat([ coordinates[0], coordinates[1]]);
                var transformCoordTwo = ol.proj.fromLonLat([( coordinates[0] + 0.005), ( coordinates[1] + 0.005 )]);
                var markCoordinates = transformCoordOne.concat(transformCoordTwo);
                return markCoordinates;
            }
            var coordArray = coordinates;
            var eastWest = (coordArray[0]-((coordArray[0]-coordArray[2])/2));
            var northSouth = (coordArray[1]-((coordArray[1]-coordArray[3])/2));
            var center = [ eastWest, northSouth ];

            return center;
        }
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .filter('class', ClassFilter);

    function ClassFilter() {

        return function classFilter(trail) {
            if (trail.name === null) {
                return;
            }
            var className = trail.name.split(' ');
            className = className.join('-');
            return className;
        };
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .filter('length', LengthFilter);

    function LengthFilter() {

        return function length(trails) {
            var trailSort = trails.sort(function sortLength(a, b) {
                if (a.length > b.length) {
                    return -1;
                } else {
                    return 1;
                }
            });
            return trailSort;
        };
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .factory('TrailandCampgroundService', TrailandCampgroundService);

    TrailandCampgroundService.$inject = [ '$http', '$rootScope' ];

    /**
     * Constructs angular service for trail and campground http requests
     * @param {Service} $http core angular service for http requests
     */
    function TrailandCampgroundService($http, $rootScope){

        return {
            findTsandCs: findTsandCs,
            findTsandCsSearchForm: findTsandCsSearchForm
        };
        /**
         * executes http request to app backend for trail and campground data
         * @param  {Array} coordinates location data based off radius rectangle
         * @return {Promise} angular promise functions            [description]
         */
        function findTsandCs(coordinates){
            var west = coordinates[0];
            var south = coordinates[1];
            var east = coordinates[2];
            var north = coordinates[3];

            return $http({
                url: '/trails',
                params: {
                    north: north,
                    south: south,
                    west: west,
                    east: east,
                    min_length: 0.01,
                    max_length: 20
                }
            })
            .then( function transformResponse(response) {
                var trails = response.data.trails;
                var campgrounds = response.data.campgrounds;
                $rootScope.searched = true;
                return { trails: trails, campgrounds: campgrounds};
            });
        }

        function findTsandCsSearchForm(searchValues) {
            var trail = searchValues.trail;
            var campground = searchValues.campground;
            var park = searchValues.park;
            return $http({
                url: 'map_items/search',
                method: 'POST',
                data: {
                    name: trail || campground,
                    park_name: park
                }
            })
            .then(function success(response){
                var trails = response.data[0].trails;
                var campgrounds = response.data[0].campgrounds;
                var center = ([ response.data[0].longitude, response.data[0].latitude]);
                sessionStorage.setItem('TsandCs', angular.toJson({ trails: trails, campgrounds: campgrounds, centerCoords: center}));
                $rootScope.searched = true;
                return { trails: trails, campgrounds: campgrounds };
            })
            .catch(function error(err) {
                console.log(err);
            });
        }

    }

}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .factory('TripService', TripService);

    TripService.$inject = [ '$http' ];

    function TripService($http) {
        var tsORcs = [];
        var markerTorC = null;

        return {
            tsORcs: tsORcs,
            addTorCtoTrip: addTorCtoTrip,
            postTrip: postTrip,
            patchTrip: patchTrip,
            mapClickedpopup: mapClickedpopup,
            addMapClickedPopup: addMapClickedPopup,
            clearTsorCs: clearTsorCs
        };

        function addTorCtoTrip (tORc) {
            tsORcs.push(tORc);
        }

        function mapClickedpopup (tORc) {
            markerTorC = tORc;
        }

        function addMapClickedPopup() {
            tsORcs.push(markerTorC);
        }

        function clearTsorCs(){
            tsORcs = [];
            return tsORcs;
        }

        function postTrip(trip) {
            var tripTrails = [];
            var tripCampgrounds = [];
            var parks = [];
            tsORcs.forEach(function gettORcID(tORc) {
                if (tORc.line) {
                    tripTrails.push(tORc.id);
                } else {
                    tripCampgrounds.push(tORc.id);
                }
            });
            return $http({
                url: '/trips',
                method: 'POST',
                data: {
                    trip: {
                        name: trip.name,
                        start_date: trip.start_date,
                        end_date: trip.end_date,
                        trip_type: trip.type,
                        camping_type: trip.camping_type,
                        trails: tripTrails,
                        campgrounds: tripCampgrounds,
                        parks: parks,
                    }
                },
                headers: {
                    Authorization: JSON.parse(sessionStorage.getItem('user')).token
                }
            })
            .then(function success(response) {
                sessionStorage.setItem('trip', angular.toJson(response.data));
                return response.data;
            })
            .catch(function error(err) {
                console.log(err);
            });
        }

        function patchTrip() {

        }
    }
}());

(function() {
    'use strict';

    angular.module('trailblazer')
        .factory('UserService', UserService);

    UserService.$inject = [ '$http', '$rootScope' ];

    function UserService($http, $rootScope) {

        return {
            createUser: createUser,
            signinUser: signinUser,
            signoffUser: signoffUser
        };

        function createUser(user, img) {
            return $http({
                url: '/users',
                method: 'POST',
                data: {
                    user: {
                        first_name: user.firstname,
                        last_name: user.lastname,
                        email: user.email,
                        profile_image: img,
                        street: user.address,
                        city: user.city,
                        state: user.state,
                        zip: user.zip,
                        password: user.password,
                        password_confirmation: user.passwordConf,
                        avatar: img
                    }
                }
            })
            .then(function success(response) {
                sessionStorage.setItem('user', angular.toJson(response.data));
                $rootScope.user = true;
                return response.data;
            });
        }

        function signinUser(user) {
            return $http({
                url: '/session',
                method: 'POST',
                data: {
                    email: user.username,
                    password: user.password,
                }
            })
            .then(function success(response) {
                sessionStorage.setItem('user', angular.toJson(response.data));
                $rootScope.user = true;
                return response.data;
            });
        }

        function signoffUser() {
            return $http({
                url: '/session',
                method: 'DELETE'
            })
            .then(function success() {
                sessionStorage.removeItem('TsandCs');
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('userToken');
                sessionStorage.removeItem('trip');
                $rootScope.user = null;
                $rootScope.searched = null;
            });
        }
    }
}());
