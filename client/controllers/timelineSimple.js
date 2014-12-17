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
    function generateHist(evt) {
        var dates = Session.get('dates');
        var features = Session.get('features') || [],
            datesSelected = [];
        if($(node).length === 0) return;
        var width = $(node).width();
        var height = $(node).height();
        //Subsequent calls to histogram will not work if there is already
        //a histogram and associated data in the timeline element.
        $(node).empty().removeData();
        $(node).histogram({
            data: dates,
            x: function (d) { return d.date.valueOf(); },
            xScale: d3.time.scale(),
            transition: 0,
            width: width,
            height: height,
            nBins: nBins
        });
        applyAxisStyle();
        
        // Highlight selected features on the visulization
        features.forEach(function (feature) {
            if (feature.type === 'datetime') {
                datesSelected.push( (new Date(feature.value)).valueOf() );
            }
        });
        d3.selectAll('.histogram .boxes').each(function (d) {
            var selected = false;
            datesSelected.forEach(function (date) {
                selected |= d.min <= date && d.max >= date;
            });
            d3.select(this).classed(
                'selected',
                selected
            );
        });
    }
    
    Template.timelineSimple.rendered = function () {
        if (!this.initialized) {
            $(window).on('resize', generateHist);
            this.initialized = true;
        }
        generateHist();
    };

    Deps.autorun(generateHist);

}(window.$, window.d3));
