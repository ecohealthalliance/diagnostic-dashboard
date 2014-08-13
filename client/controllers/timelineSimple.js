/*jslint browser: true, nomen: true, unparam: true*/

(function ($, d3) {
    'use strict';

    var nBins = 30,
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

    Template.timelineSimple.createTimeline = function () {
        var template = this;
        if (!this.initialized) {
            $(node).on('resizeApp', function (evt, obj) {
                $(node).histogram({
                    data: template.dates,
                    x: function (d) { return d.date.valueOf(); },
                    xScale: d3.time.scale(),
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

        $(node).trigger('resizeApp', {
            width: $(node).width(),
            height: $(node).height()
        });
        return template;
    };

    Deps.autorun(function () {
        var features = Session.get('features') || [],
            dates = [];
        features.forEach(function (feature) {
            if (feature.type === 'datetime') {
                dates.push( (new Date(feature.value)).valueOf() );
            }
        });
        
        d3.selectAll('.histogram .boxes').each(function (d) {
            var selected = false;
            dates.forEach(function (date) {
                selected |= d.min <= date && d.max >= date;
            });
            d3.select(this).classed(
                'selected',
                selected
            );
        });
    });

}(window.$, window.d3));
