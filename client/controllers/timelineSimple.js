/*jslint browser: true, nomen: true, unparam: true*/

(function ($, d3) {
    'use strict';

    var nBins = 50,
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
    
    Template.timelineSimple.rendered = function () {
        var data = [];
        if (!this.initialized) {
            $(node).on('datachanged', function (evt, args) {
                data = [];
                if (!args.data.length) {
                    return;
                }
                args.data.forEach(function (d) {
                    if (!d.date) {
                        return;
                    }
                    d.value = d.date.valueOf();
                    data.push(d);
                });
                $(node).histogram({
                    data: data,
                    x: { field: 'value' },
                    transition: 250,
                    margin: margin,
                    xTicks: xTicks,
                    yTicks: yTicks,
                    xScale: d3.time.scale(),
                    nBins: nBins
                });
                applyAxisStyle();
            }).on('resizeApp', function (evt, obj) {
                $(node).histogram({
                    data: data,
                    x: { field: 'value' },
                    transition: 0,
                    margin: margin,
                    width: obj.width,
                    height: obj.height,
                    nBins: nBins
                });
                applyAxisStyle();
            });
            this.initialized = true;
        }
    };
}(window.$, window.d3));
