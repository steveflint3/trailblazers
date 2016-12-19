(function() {
    'use strict';

    var view = new ol.View({
        center: [ -6217890.205764902, -1910870.6048274133 ],
        zoom: 4,
        maxZoom: 18,
        minZoom: 2
    });

    var baseLayer = new ol.layer.Tile({
        source: new ol.source.OSM({ layer: 'osm' })
    });

    map = new ol.Map({
        target: 'map',
        controls: ol.control.defaults().extend([
            new ol.control.ScaleLine(),
            new ol.control.ZoomSlider()
        ]),
        renderer: 'canvas',
        layers: [baseLayer],
        view: view
    });
}());
