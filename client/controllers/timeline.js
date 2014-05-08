/*jslint browser: true, nomen: true, unparam: true*/

(function ($, d3) {
    'use strict';

    var nBins = 250,
        radius = 10/nBins,
        padding = 30,
        node = '#timeline';

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
            j = Math.floor((d.properties.date.valueOf() - s) / dt);
            if (j >= 0 && j < nBins) {
                bins[j].value += 1;
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
    
    Template.timeline.rendered = function () {
        var data = [];
        if (!this.initialized) {
            $(node).on('datachanged', function (evt, args) {
                data = binData(args.data, args.dataStart, args.dataEnd);
                $(node).timeline({
                    data: data,
                    x: { field: 'time' },
                    y: { field: 'value' },
                    transition: 250,
                    padding: padding
                });
            }).on('resizeApp', function (evt, obj) {
                $(node).timeline({
                    data: data,
                    x: { field: 'time' },
                    y: { field: 'value' },
                    transition: 0,
                    padding: padding,
                    width: obj.width,
                    height: obj.height
                });
            });
            this.initialized = true;
        }
    };
}(window.$, window.d3));
