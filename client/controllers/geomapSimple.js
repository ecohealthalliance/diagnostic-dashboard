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
            width: null,
            height: null
        },
        _create: function () {
          var that = this;
          this._super();
          this.element.on('rescale', function () {
              that._rescale();
          });
          this._geomapCreated = true;
          this._data = [];
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
                msg.push('<b>Location: </b>' + data.location);
                $(this).popover({
                    html: true,
                    container: 'body',
                    placement: 'auto top',
                    trigger: 'manual',
                    content: msg.join('<br>\n')
                })
                .on('mouseover', function () {
                    $(this).popover('show');
                })
                .on('mouseout', function () {
                    $(this).popover('hide');
                });
            }

            svg = d3.select(this.svg());
            select = svg.selectAll('.marker')
                        .data(this._data);
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

    var node = '#geomap';

    Template.geomapSimple.rendered = function () {
        if (!this.initialized) {
            $(node)
                .on('datachanged', function (evt, data) {
                    $(node).healthmapMapSimple(data);
                })
                .on('resizeApp', function (evt, obj) {
                    $(node).healthmapMapSimple({
                        width: obj.width,
                        height: obj.height,
                        zoom: 3
                    });
                });
            this.initialized = true;
        }
    };

}(window.tangelo, window.jQuery, window.geo, window.d3));
