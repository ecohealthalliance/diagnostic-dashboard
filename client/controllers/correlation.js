/*jslint browser: true, unparam: true*/
(function () {

    var _p = Math.PI/180,
        _mpy = 7 * 24 * 60 * 60 * 1000;
    function distNorm(a, b) {
        // distance between points on a sphere
        // scaled so that points on opposite sides have distance 1
        // code modified from 
        // http://www.codecodex.com/wiki/Calculate_Distance_Between_Two_Points_on_a_Globe
        var lon1 = a.geometry.coordinates[0],
            lat1 = a.geometry.coordinates[1],
            lon2 = b.geometry.coordinates[0],
            lat2 = b.geometry.coordinates[1];
        
        var dLat = (lat2-lat1)*_p/2;
        var dLon = (lon2-lon1)*_p/2; 
        var alpha = Math.sin(dLat) * Math.sin(dLat) +
                    Math.cos(lat1*_p) * Math.cos(lat2*_p) * 
                    Math.sin(dLon) * Math.sin(dLon); 
        var c = 2 * Math.asin(Math.sqrt(alpha)); 
        return c / Math.PI;

    }

    function timeNorm(a, b, interval) {
        // distance in time scaled so that interval === 1
        interval = interval || _mpy;
        var t1 = a.properties.date,
            t2 = b.properties.date;
        return (Math.abs(t1 - t2) / interval);
    }

    function speciesNorm(a, b) {
        // discrete norm in species name
        return a.properties.species === b.properties.species ? 0 : 1;
    }

    function symptomNorm(a, b) {
        // some norm on symptoms list, currently implemented as the Jaccard distance:
        // http://en.wikipedia.org/wiki/Jaccard_index
        var l1 = a.properties.symptoms.slice(),
            l2 = b.properties.symptoms.slice(),
            nInt = 0, nUni = 0;
        
        if (!l1.length && !l2.length) {
            // special case when both lists are empty
            return 1;
        }

        // compute the cardinality of the union and intersection
        // symptom arrays should be presorted
        while( l1.length > 0 && l2.length > 0) {
            if (l1[0] < l2[0]) {
                l1.shift();
                nUni++;
            } else if (l1[0] > l2[0]) {
                l2.shift();
                nUni++;
            } else {
                l1.shift();
                l2.shift();
                nUni++;
                nInt++;
            }
        }
        nUni += l1.length + l2.length;

        return ((nUni - nInt) / nUni);
    }

    // This function returns a function that computes the distance from the given
    // target incident.  Constants given in the argument define the weight
    // given to individual components of the norm.  All norms are scaled to 
    // return values in [0, 1].
    window.IncidentNorm = function (arg) {
        arg = arg || {};
        
        var interval = arg.timeInterval;
        function norm(x) {
            // scale output to range [0,1]
            var c1 = norm.cSpecies * norm.cSpecies,
                c2 = norm.cSymptoms * norm.cSymptoms,
                c3 = norm.cLocation * norm.cLocation,
                c4 = norm.cTime * norm.cTime,
                c = Math.sqrt(c1 + c2 + c3 + c4) || 1,
                n1 = Math.min(speciesNorm(norm.target, x), 1),
                n2 = Math.min(symptomNorm(norm.target, x), 1),
                n3 = Math.min(distNorm(norm.target, x), 1),
                n4 = Math.min(timeNorm(norm.target, x, interval), 1);
            return {
                value: Math.sqrt(
                c1 * n1 * n1 + 
                c2 * n2 * n2 +
                c3 * n3 * n3 +
                c4 * n4 * n4
                )/c,
                species: {
                    c: c1,
                    value: n1
                },
                symptoms: {
                    c: c2,
                    value: n2
                },
                distance: {
                    c: c3,
                    value: n3
                },
                time: {
                    c: c4,
                    value: n4
                }
            };
        }
        norm.cSpecies = arg.cSpecies || 0;
        norm.cSymptoms = arg.cSymptoms || 0;
        norm.cLocation = arg.cLocation || 0;
        norm.cTime = arg.cTime || 0;
        norm.target = arg.target || null;
        
        return norm;
    };
}());

(function ($) {
    'use strict';
   
    var node = '#correlation';

    function applyScores(data, targetIncident, dates) {
        var norm = new IncidentNorm({
                target: targetIncident,
                cSpecies: 1,//$('#cSpecies').slider('value'),
                cSymptoms: 1,//$('#cSymptoms').slider('value'),
                cTime: 1,//$('#cTime').slider('value'),
                cLocation: 1,//$('#cDistance').slider('value'),
                timeInterval: dates.end - dates.start
        });

        data.forEach(function (d) {
            var o = norm(d),
                n = Math.min(o.value, 1);
            d.properties.score = 1 - n;
            d.properties.scoreObj = o;
        });

        data.sort(function (a, b) {
            return a.properties.score > b.properties.score ? 1 : -1;
        });
    }

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
                    $(node).correlationPlot('data', arg.data);
                    $(node).trigger('draw');
            })
                .resize(function () {
                $(node).trigger('draw');
            });
            this.initialized = true;
        }

        d3.json('../data/hmData.json', function (err, obj) {
            var data = obj.features;
            if (data.length) {
                var start, end;
                start = new Date(data[0].properties.date);
                end = new Date(data[0].properties.date);
                data.forEach(function (d) {
                    d.properties.date = new Date(d.properties.date);
                    if (d.properties.date < start) {
                        start = d.properties.date;
                    }
                    if (d.properties.date > end) {
                        end = d.properties.date;
                    }
                });
                applyScores(data, data[0], {start: start, end: end});
                $(node).trigger('datachanged', {
                    target: data[0],
                    threshold: 0.0,
                    data: data
                });
            }
        });
    };
}(window.$));
