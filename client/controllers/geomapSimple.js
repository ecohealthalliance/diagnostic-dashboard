/*jslint browser: true, unparam: true*/
/*global Template*/

(function (tangelo, $, geo, d3) {
    'use strict';

    var widgetSpec = {
        options: {
            data: [],
            target: null,
            pointSize: {'value': 5},
            lineWidth: {'value': 1},
            width: 400,
            height: 400
        },
        _create: function () {
          var that = this;
          this._super();
          this.element.on('rescale', function () {
              that._rescale();
          });
          this.map().on([geo.event.pan, geo.event.zoom, geo.event.resize], function () {
              $('body div.popover').popover('hide');
          });
          this._geomapCreated = true;
          this._data = [];
          this._update();
        },
        _rescale: function () {
            var that = this,
                scale,
                lw = tangelo.accessor(this.options.lineWidth),
                pt = tangelo.accessor(this.options.pointSize);
            if (this.map()) {
                scale = this.scale();
                d3.select(this.svg())
                    .selectAll('.marker')
                    .data(this._data)
                    .attr('r', function (d) {
                        return pt(d) / scale;
                    })
                    .style('stroke-width', function (d) {
                        return lw(d) / scale;
                    });
            }
        },
        resize: function () {
            this._resize();
        },
        _update: function () {
            var that = this,
                svg,
                select,
                enter,
                exit,
                lat = tangelo.accessor({'field': '_georef.y'}),
                lng = tangelo.accessor({'field': '_georef.x'});

            if (!this._geomapCreated) {
                return;
            }

            this._super();
            // georeference the data
            this._data = [];
            this.options.data.forEach(function (d) {
                if (Number.isFinite(d.latitude) && Number.isFinite(d.longitude)) {
                    var pt = geo.latlng(d.latitude, d.longitude);
                    d._georef = that.latlng2display(pt);
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

                $(this).popover({
                    html: true,
                    container: 'body',
                    placement: 'auto top',
                    trigger: 'manual',
                    content: msg.join('<br>\n')
                })
                .on('mousedown', function (evt) {
                    $(this).popover('toggle');
                    evt.stopPropagation();
                });
            }

            function indexFunc(d, i) {
                return d.name || i;
            }

            svg = d3.select(this.svg());
            select = svg.selectAll('.marker')
                        .data(this._data, indexFunc);
            enter = select.enter();
            exit = select.exit();

            enter
              .append('circle')
                .attr('class', 'marker')
                .each(makePopOver);

            exit.remove();

            select
                .attr('cx', lng)
                .attr('cy', lat);
            this._rescale();
        }
    };

    tangelo.widget('tangelo.healthmapMapSimple', $.tangelo.geojsMap, widgetSpec);

    var node = '#geomap',
        tileURL;

    // Set the base url for the osm tile server.  When serving over
    // https, this should be proxied locally and the tile url
    // set to something like '/tiles/', where
    //
    //   https://localhost/tiles/ -> http://tile.openstreetmap.org/
    //
    // by apache mod_proxy.
    tileURL = '/tiles/';

    Template.geomapSimple.rendered = function () {
        if (!this.initialized) {
            $(node)
                .on('resizeApp', function (evt, obj) {
                    $(node).healthmapMapSimple({
                        width: obj.width,
                        height: obj.height,
                        zoom: 3
                    });
                });
            this.initialized = true;
        }
        $(node).healthmapMapSimple({
            data: Session.get('locations')
        });
    };

    Deps.autorun(function () {
        $(node).healthmapMapSimple({
            data: Session.get('locations'),
            tileURL: tileURL
        });
    });

    Deps.autorun(function () {
        var features = Session.get('features') || [],
            locations = [];
        features.forEach(function (feature) {
            if (feature.type === 'location') {
                locations.push(feature);
            }
        });
        d3.selectAll(node + ' circle').each(function (d) {
            var selected = false;
            locations.forEach(function (location) {
                selected |= Math.abs(d.latitude - location.geoname.latitude) < 10e-6 &&
                            Math.abs(d.longitude - location.geoname.longitude) < 10e-6;
            });
            d3.select(this).classed(
                'selected',
                selected
            );
            if (selected) {
                // move the selected circles to the top
                this.parentNode.appendChild(this);
            }
        });
    });

}(window.tangelo, window.jQuery, window.geo, window.d3));
