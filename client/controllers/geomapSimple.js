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
          this.element.on('draw', function () {
              that._update();
          });
        },
        _update: function () {
            var that = this,
                svg = d3.select(this.svgGroup),
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
                    d._georef = that.latlng2display(pt)[0];
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
                })
                .on('click', function (d) {
                    var links = _.chain(grits.GirderItems.find({'meta.country': d.country}).fetch())
                        .pluck('meta')
                        .pluck('link')
                        .value();
                    $(this).popover({
                        content: links.map(function (l) { return '<a href="' + l + '">' + l + '</a>'; }).join('\n')
                    });

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
