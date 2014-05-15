/*jslint browser: true, unparam: true*/
/*global Template*/

(function (tangelo, $, geo, d3) {
    'use strict';

    var colorbrewer = {PuBu: {
    3: ["#ece7f2","#a6bddb","#2b8cbe"],
    4: ["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],
    5: ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
    6: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],
    7: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
    8: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
    9: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
    }};

    var cscale = colorbrewer.PuBu[3];

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
                data = this.options.data,
                select = svg.selectAll('.point')
                            .data(data, tangelo.accessor({'field': 'properties.id'})),
                enter = select.enter(),
                exit = select.exit(),
                target = this.options.target,
                opacity = 1.0,
                lat = tangelo.accessor({'field': '_georef.y'}),
                lng = tangelo.accessor({'field': '_georef.x'}),
                link = tangelo.accessor({'field': 'properties.link'}),
                midDate, color, dateStart, dateEnd;

            if (!target) {
                return;
            }
            dateStart = Number.POSITIVE_INFINITY;
            dateEnd = 0;
            data.forEach(function (d) {
                var pt = geo.latlng(d.geometry.coordinates[1], d.geometry.coordinates[0]),
                    date = d.properties.date.valueOf();
                d._georef = that.latlng2display(pt)[0];
                if (date < dateStart) {
                    dateStart = date;
                }
                if (date > dateEnd) {
                    dateEnd = date;
                }
            });

            midDate = (dateStart + dateEnd)/2;
            color = d3.scale.linear()
                        .domain([dateStart, midDate, dateEnd])
                        .range(cscale)
                        .clamp(true);

            function setProperties(d) {
                d3.select(this)
                    .style({
                        'fill': function (d) {
                            if (d.properties.id === target.properties.id) {
                                return 'red';
                            }
                            return color(d.properties.date);
                        },
                        'stroke-opacity': opacity,
                        'fill-opacity': opacity,
                        'stroke': 'black',
                        'stroke-width': '0.5pt',
                        'pointer-events': 'auto'
                    })
                    .attr('r', '5pt')
                    .attr('cx', lng)
                    .attr('cy', lat);
            }

            function makePopOver(data) {
                var msg = [];
                msg.push('<b>Summary:</b> ' + data.properties.summary);
                msg.push('<b>Date:</b> ' + data.properties.date.toString());
                msg.push('<b>Location:</b> ' + data.properties.country);
                msg.push('<b>Disease:</b> ' + data.properties.disease);
                msg.push('<b>Symptoms:</b> ' + data.properties.symptoms.join(', '));
                msg.push('<b>Species:</b> ' + data.properties.species);
                msg.push('<b>Similarity:</b> ' + data.properties.score.toFixed(2));
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

            enter
              .append('svg:a')
                .attr('class', 'point')
                .attr('xlink:href', link)
                .attr('target', 'healthMapInfo')
              .append('circle')
                .each(makePopOver);

            exit.remove();

            select.select('circle')
                .each(setProperties);
        }
    };

    tangelo.widget('tangelo.healthmapMap', $.tangelo.geojsMap, widgetSpec);

    var node = '#geomap';

    Template.geomap.rendered = function () {
        if (!this.initialized) {
            $(node).healthmapMap()
                .on('datachanged', function (evt, args) {
                    $(node).healthmapMap({
                      target: args.target,
                      data: args.data
                    });
                })
                .on('resizeApp', function (evt, obj) {
                    $(node).healthmapMap({
                        width: obj.width,
                        height: obj.height
                    });
                });
            this.initialized = true;
        }
    };

}(window.tangelo, window.jQuery, window.geo, window.d3));
