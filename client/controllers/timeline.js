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
            }).on('resize.div', function () {
                $(node).timeline({
                    data: data,
                    x: { field: 'time' },
                    y: { field: 'value' },
                    transition: 0,
                    padding: padding
                });
            });
            this.initialized = true;
        }
        d3.json('../data/hmData.json', function (err, obj) {
            var d = obj.features;
            if (d.length) {
                var start, end;
                start = new Date(d[0].properties.date);
                end = new Date(d[0].properties.date);
                d.forEach(function (e) {
                    e.properties.date = new Date(e.properties.date);
                    if (e.properties.date < start) {
                        start = e.properties.date;
                    }
                    if (e.properties.date > end) {
                        end = e.properties.date;
                    }
                });
                $(node).trigger('datachanged', {
                    data: d,
                    dataStart: start,
                    dataEnd: end
                });
            }
        });
    };
}(window.$, window.d3));
