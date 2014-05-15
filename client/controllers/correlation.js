/*jslint browser: true, unparam: true*/

(function ($) {
    'use strict';
   
    var node = '#correlation';

    Template.correlation.rendered = function () {
        var distance = function (d) { return d.properties.scoreObj.distance.value; },
            time = function (d) { return d.properties.scoreObj.time.value; },
            symptoms = function (d) { return d.properties.scoreObj.symptoms.value; },
            species = function (d) { return d.properties.scoreObj.species.value; },
            comp = [
                distance,
                time,
                symptoms,
                species
            ],
            threshold = 0.5,
            target = {properties: {}},
            color = function (d) {
                if (d.properties.id === target.properties.id) {
                    return 'red';
                }
                return d.properties.score > threshold ? 'steelblue' : 'white';
            };
        if (!this.initialized) {
            distance.label = 'distance';
            time.label = 'time';
            symptoms.label = 'symptoms';
            species.label = 'species';
            $(node).correlationPlot({
                variables: comp,
                color: color
            })
            .on('datachanged', function (evt, arg){
                target = arg.target;
                threshold = arg.threshold;
                $(node).correlationPlot({'data': arg.data});
            })
            .on('resizeApp', function (evt, obj) {
                $(node).correlationPlot(obj);
            });
            this.initialized = true;
        }
    };
}(window.$));
