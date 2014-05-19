/*jslint browser: true, nomen: true, unparam: true*/

(function ($, d3) {
    'use strict';

    var nBins = 250,
        radius = 10/nBins,
        margin = {
            top: 25,
            left: 30,
            right: 40,
            bottom: 55
        },
        xTicks = 6,
        yTicks = 6,
        node = '#timeline';

    function applyAxisStyle() {
        d3.select(node)
            .selectAll('.x-axis text')
            .style('text-anchor', 'start')
            .attr('transform', 'rotate(45)')
            .attr('dx', '0.5em')
            .attr('dy', '0.1em');
    }

    function binData(data, start, end) {
        var bins = [], 
            s = start.valueOf(),
            e = end.valueOf(),
            dt = (e - s)/(nBins - 1),
            i, j, d;
        bins.length = 100;
        for (i = 0; i < nBins; i++) {
            bins[i] = {
                time: s + i * dt,
                value: 0
            };
        }
        for (i = 0; i < data.length; i++) {
            d = data[i];
            if (d.date) {
                j = Math.floor((d.date.valueOf() - s) / dt);
                if (j >= 0 && j < nBins) {
                    bins[j].value += 1;
                }
            }
        }
        tangelo.data.smooth({
            data: bins,
            radius: radius,
            kernel: 'gaussian',
            absolute: false,
            set: function (v, d) { d.value = v; },
            sorted: true,
            x: { field: 'time' },
            y: { field: 'value' }
        });
        return bins;
    }
    
    Template.timelineSimple.rendered = function () {
        var data = [];
        if (!this.initialized) {
            $(node).on('datachanged', function (evt, args) {
                if (!args.data.length) {
                    return;
                }
                var start = null, end = null;
                args.data.forEach(function (d) {
                    if (!d.date) {
                        return;
                    }
                    if (!start || d.date < start) {
                        start = d.date;
                    }
                    if (!end || d.date > end) {
                        end = d.date;
                    }
                });
                if (start && end) {
                    data = binData(args.data, start, end);
                } else {
                    data = [];
                }
                $(node).timeline({
                    data: data,
                    x: { field: 'time' },
                    y: { field: 'value' },
                    transition: 250,
                    margin: margin,
                    xTicks: xTicks,
                    yTicks: yTicks
                });
                applyAxisStyle();
            }).on('resizeApp', function (evt, obj) {
                $(node).timeline({
                    data: data,
                    x: { field: 'time' },
                    y: { field: 'value' },
                    transition: 0,
                    margin: margin,
                    width: obj.width,
                    height: obj.height
                });
                applyAxisStyle();
            });
            this.initialized = true;
        }
    };
}(window.$, window.d3));
