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
    function whenElementExpands($el, cb, waitFor) {
        if(_.isUndefined(waitFor)) {
            waitFor = 6000;
        }
        if(waitFor < 0) {
            alert("Could not generate hisogram.");
            return;
        } else if($el.height() < 1 || $el.width() < 1) {
            window.setTimeout(
                _.partial(whenElementExpands, $el, cb, waitFor - 1000),
                1000
            );
        } else {
            cb();
        }
    }
    function generateHist(evt) {
        if($(node).length === 0) return;
        whenElementExpands($(node).parent(), function(){
            // There is a bug that's causing the viz dimensions not
            // to match those of the parent element.
            // Subtracting is done to prevent overflows
            // from triggering scroll bars.
            var width = $(node).parent().width() - 8;
            var height = $(node).parent().height() - 8;
            //Subsequent calls to histogram will not work if there is already
            //a histogram and associated data in the timeline element.
            $(node).empty().removeData();
            $(node).histogram({
                data: Session.get('dates'),
                x: function (d) { return d.date.valueOf(); },
                xScale: d3.time.scale(),
                transition: 0,
                width: width,
                height: height,
                nBins: nBins
            });
            applyAxisStyle();
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

    // Highlight selected features on the visulization
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
