/*jslint browser: true, unparam: true*/
/*global Template*/

(function (tangelo, $, geo, d3) {
    'use strict';

    var widgetSpec = {
        options: {
            data: [],
            target: null
        },
        _create: function () {
          var that = this;
          this._super();
          this.element.on('rescale', function () {
              that._rescale();
          });
        },
        _rescale: function () {
            var that = this,
                scale;
            if (this.options.data && this.map()) {
                scale = this.scale();
                d3.select(this.svg())
                    .selectAll('.point')
                    .data(this.options.data)
                    .attr('r', function (d) {
                        return tangelo.accessor(that.options.size)(d) / scale;
                    });
            }
        },
        _update: function () {
            var that = this,
                svg = this.svgGroup,
                data = [],
                select,
                enter,
                exit,
                lat = tangelo.accessor({'field': '_georef.y'}),
                lng = tangelo.accessor({'field': '_georef.x'}),
                radius;

            // georeference the data
            this.options.data.forEach(function (d) {
                if (Number.isFinite(d.latitude) && Number.isFinite(d.longitude)) {
                    var pt = geo.latlng(d.latitude, d.longitude);
                    d._georef = that.latlng2display(pt);
                    data.push(d);
                }
            });
            
            // set the circle size
            radius = tangelo.accessor({'value': '5pt'});

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
            select = svg.selectAll('.marker')
                        .data(data);
            enter = select.enter();
            exit = select.exit();

            enter
              .append('circle')
                .attr('class', 'marker')
                .each(makePopOver);

            exit.remove();

            select
                .attr('r', radius)
                .attr('cx', lng)
                .attr('cy', lat);
        }
    };

    tangelo.widget('tangelo.healthmapMapSimple', $.tangelo.geojsMap, widgetSpec);

    var node = '#geomap';

    Template.geomapSimple.rendered = function () {
        if (!this.initialized) {
            $(node).healthmapMapSimple()
                .on('datachanged', function (evt, data) {
                    $(node).healthmapMapSimple(data);
                })
                .on('resizeApp', function (evt, obj) {
                    $(node).healthmapMapSimple({
                        width: obj.width,
                        height: obj.height
                    });
                });
            this.initialized = true;
        }
    };

}(window.tangelo, window.jQuery, window.geo, window.d3));
