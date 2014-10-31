/*jslint browser: true, unparam: true*/
/*global Template*/

(function ($, geo, d3) {
    'use strict';

    var widgetSpec = {
        options: {
            data: [],
            target: null,
            pointSize: 5,
            lineWidth: 1,
            width: 400,
            height: 400
        },
        _create: function () {
            // remove global viewer context if it exists to get around vgl bug
            window.gl = null;

            var that = this;

            this._map = geo.map({node: this.element.get(0), zoom: 0});
            this.resize();

            this.element.on('rescale', function () {
                that.resize();
            });

            this._osm = this._map.createLayer('osm');

            this._layer = this._map.createLayer('feature', {'renderer': 'd3Renderer'});
            this._feature = this._layer.createFeature('point');

            this._layer.geoOn([geo.event.pan, geo.event.zoom, geo.event.resize], function () {
              $('body div.popover').popover('hide');
            });
            this._geomapCreated = true;
            this._data = [];
            this.update();
        },
        _destroy: function () {
            this._map.interactor().destroy();
        },
        map: function () {
            return this._map;
        },
        selection: function () {
            if (this._feature) {
                return this._feature.select();
            } else {
                return [];
            }
        },
        resize: function () {
            this.map().resize(0, 0, this.options.width, this.options.height);
        },
        update: function () {
            var that = this;

            if (!this._geomapCreated) {
                this._create();
                return;
            }

            // georeference the data
            this._data = [];
            this.options.data.forEach(function (d) {
                if (Number.isFinite(d.latitude) && Number.isFinite(d.longitude)) {
                    that._data.push(d);
                }
            });

            // function for adding a pop over on mouse over
            function makePopOver(data) {
                var msg = [];

                msg.push('<b>Location:</b> ' + (data.location || data.country));
                if (data.summary) {
                    msg.push('<b>Summary:</b> ' + data.summary);
                }
                if (data.date) {
                    msg.push('<b>Date:</b> ' + data.date.toLocaleString());
                }
                if (data.disease) {
                    msg.push('<b>Disease:</b> ' + data.disease);
                }
                if (data.symptoms) {
                    msg.push('<b>Symptoms:</b> ' + data.symptoms.join(', '));
                }
                if (data.species) {
                    msg.push('<b>Species:</b> ' + data.species);
                }
                if (data.link) {
                    msg.push('<a target="MarkerArticle" href="' + data.link + '">link</a>');
                }

                $(this)
                .popover({
                    html: true,
                    container: 'body',
                    placement: 'auto top',
                    trigger: 'manual',
                    content: msg.join('<br>\n')
                })
                .off('mousedown')
                .on('mousedown', function (evt) {
                    $(this).popover('toggle');
                    evt.stopPropagation();
                });
            }

            this._feature
                .data(this._data)
                .position(function (d) {
                    return {
                        x: d.longitude,
                        y: d.latitude
                    };
                })
                .style({
                    stroke: function () { return true; },
                    strokeWidth: function () { return that.options.lineWidth; },
                    strokeColor: function () { return {r: 0, g: 0, b: 0}; },
                    strokeOpacity: function () { return 1; },
                    fill: function () { return true; },
                    fillColor: function (d) {
                        if (!d.selected) {
                            return {r: 70/255, g: 130/255, b: 180/255 };
                        } else {
                            return {r: 1, g: 0, b: 0};
                        }
                    },
                    fillOpacity: function (d) {
                        if (!d.selected) {
                            return 0.5;
                        } else {
                            return 1;
                        }
                    },
                    radius: function () { return that.options.pointSize; }
                })
                .draw();
            this._feature.select().each(function (d) {
                makePopOver.call(this, d);
                if (d.selected) {
                    this.parentNode.appendChild(this);
                }
            });
            this.resize();
        }
    };

    $.widget('grits.gritsMap', widgetSpec);

    var node = '#geomap';

    Template.geomapSimple.rendered = function () {
        if (!this.initialized) {
            $(node)
                .on('resizeApp', function (evt, obj) {
                    $(node).gritsMap({
                        width: obj.width,
                        height: obj.height
                    })
                    .gritsMap('resize');

                });
            this.initialized = true;
        }
        $(node).gritsMap({
            data: Session.get('locations')
        });
    };

    Deps.autorun(function () {
        $(node).gritsMap({
            data: Session.get('locations')
        })
        .gritsMap('update');
    });

    Deps.autorun(function () {
        var features = Session.get('features') || [],
            locations = [],
            data = [];
        features.forEach(function (feature) {
            if (feature.type === 'location') {
                locations.push(feature);
            }
        });
        $(node).gritsMap('selection').each(function (d) {
            var selected = false;
            locations.forEach(function (location) {
                selected |= Math.abs(d.latitude - location.geoname.latitude) < 10e-6 &&
                            Math.abs(d.longitude - location.geoname.longitude) < 10e-6;
            });
            d.selected = selected;
            data.push(d);
        });
        $(node).gritsMap({data: data}).gritsMap('update');
    });

}(window.jQuery, window.geo, window.d3));
