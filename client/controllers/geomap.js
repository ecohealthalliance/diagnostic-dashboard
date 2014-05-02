/*jslint browser: true, unparam: true*/
// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
var colorbrewer = {PuBu: {
3: ["#ece7f2","#a6bddb","#2b8cbe"],
4: ["#f1eef6","#bdc9e1","#74a9cf","#0570b0"],
5: ["#f1eef6","#bdc9e1","#74a9cf","#2b8cbe","#045a8d"],
6: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#2b8cbe","#045a8d"],
7: ["#f1eef6","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
8: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#034e7b"],
9: ["#fff7fb","#ece7f2","#d0d1e6","#a6bddb","#74a9cf","#3690c0","#0570b0","#045a8d","#023858"]
}};
(function ($, geo, d3) {
    
    // create a group of markers inside the given geojs layer
    function GeoApplicationGroup(id, layer, jdiv) {
        var renderer = layer.renderer(),
            svg = renderer.canvas().append('g').attr('id', id),
            ll2xy = renderer.latLngToDisplayGenerator(),
            trans = [0, 0],
            center;
        
        // where we keep the geo transformation cache in the data objects
        // we could store it somewhere else, but then we need to deal with dataIndexer
        var _x = '_x_' + id,
            _y = '_y_' + id;

        center = [ jdiv.width()/2, jdiv.height()/2 ];

        // set default styles/accessors/data
        jdiv.data(id, {
                lat: function (d) { return d.lat(); },
                lng: function (d) { return d.lng(); },
                r: '3pt',
                transition: null,
                style: {
                    fill: 'blue',
                    stroke: 'none',
                    'fill-opacity': 1.0,
                    'stroke-opacity': 1.0
                },
                handlers: {},
                each: function () {},
                enter: {
                    //lat: center.x,
                    //lng: center.y,
                    r: '0pt',
                    transition: {
                        delay: 0,
                        duration: 500,
                        ease: 'cubic-in-out'
                    },
                    style: {
                        'fill-opacity': 0.0,
                        'stroke-opacity': 0.0
                    },
                    handlers: {}
                },
                exit: {
                    //lat: center.x,
                    //lng: center.y,
                    r: '0pt',
                    transition: {
                        delay: 0,
                        duration: 500,
                        ease: 'cubic-in-out'
                    },
                    style: {
                        'fill-opacity': 0.0,
                        'stroke-opacity': 0.0
                    },
                    handlers: {}
                },
                filter: function () { return true; },
                data: [],
                dataIndexer: null,
                flushGeoCache: true  // for recompute of geo transform, broken right now
            }
        );
        
        // apply styling rules to a selection
        function applyStyle(s, opts) {
            var key;
            function addHandler(event, handler) {
                return function () {
                    d3.select(this).on(event, handler);
                };
            }
            s
                .attr('cx', function (d) { return d[_x]; })
                .attr('cy', function (d) { return d[_y]; })
                .attr('r', opts.r)
                .style(opts.style);
            for (key in opts.handlers) {
                if (opts.handlers.hasOwnProperty(key)) {
                    s.each(addHandler(key, opts.handlers[key]));
                }
            }
            if (opts.each) {
                s.each(opts.each);
            }
            return s;
        }

        // create a selection transition
        function applyTransition(s, trans) {
            if (!trans) {
                return s;
            }
            return s.transition()
                        .delay(trans.delay || 0)
                        .duration(trans.duration === undefined ? 500 : trans.duration)
                        .ease(trans.ease || 'cubic-in-out');
        }

        this.draw = function (aOpts) {
            // extract draw options
            var flushCache = (aOpts || {}).flushCache;

            // tell geojs we are modifying the data
            layer.modified();

            // extract styles/accessors
            var opts = jdiv.data(id);
            
            // compute geo transform
            opts.data.forEach(function (d) {
                var pt, lat;
                if (flushCache || opts.flushGeoCache || !d.hasOwnProperty(_x) || !d.hasOwnProperty(_y)) {
                    // hack to get around weirdness of geoTransform in geojs...
                    lat = geo.mercator.lat2y(opts.lat(d));
                    pt = ll2xy(geo.latlng(lat, opts.lng(d)));
                    d[_x] = pt.x() - trans[0];
                    d[_y] = pt.y() - trans[1];
                }
                //opts.flushGeoCache = false;
            });

            // create the selection
            var pts = svg.selectAll('.dataPoints').data(opts.data.filter(opts.filter), opts.dataIndexer);
            
            // apply exit style/transition
            applyStyle(applyTransition(pts.exit(), opts.exit.transition), opts.exit).remove();

            // apply main style/transition
            applyStyle(applyTransition(pts, opts.transition), opts);

            // append elements on enter
            var enter = pts.enter()
                .append('circle')
                .attr('class', 'dataPoints');

            // apply enter style
            applyStyle(enter, opts.enter);
            
            // apply enter style/transition
            applyStyle(applyTransition(enter, opts.enter.transition), opts);

            // reset main transition
            jdiv.data({transition: null});

        };

        this.translate = function (t) {
            if (t === undefined) {
                trans = [0, 0];
            } else {
                trans[0] += t[0];
                trans[1] += t[1];
            }
            svg.attr('transform', 'translate(' + trans.toString() + ')');
        };
    }
    
    // initialize a geojs map inside `elem`
    function initialize(params) {
        var defaults = {
                zoom: 2,
                center: [0, 0]
        };
        params = $.extend(true, {}, defaults, params);

        this.each(function () {
            // we need to change geojs to accept a jquery node...
            var m_this = this,
                m_node = $(m_this),
                savedOpts = {};

            // check if this element has already been initialized with a map
            // ( we can't currently destroy an existing map )
            if (m_node.data('_mapLayer') !== undefined) {
                throw 'geojsMap called twice on the same element';
            }

            // create the map and layers
            var mapOpts = $.extend({ node: this }, params),
                map = geo.map(mapOpts),
                osm = geo.osmLayer({'renderer': 'vglRenderer'}).referenceLayer(true),
                layer = geo.featureLayer({'renderer': 'd3Renderer'});
            
            // resize handler
            function resize() {
                var oldTransition = m_node.data('transition');
                map.resize(0, 0, m_node.width(), m_node.height());
                m_node.data('transition', null);
                // georeferencing needs to be recomputed on resize
                m_node.trigger('draw', { flushCache: true });
                m_node.data('transition', oldTransition);
            }

            // set up data handlers
            m_node.on('draw', function (evt, opts) {
                var groups = m_node.data('_mapGroups');
                savedOpts = opts;
                $.map(groups, function (g) {
                    g.draw(opts);
                });
            });

            layer.on([geo.event.pan, geo.event.zoom], function (evt) {
                var groups = m_node.data('_mapGroups');
                $.map(groups, function (g) {
                    g.draw(savedOpts);
                });
            });

            // layer object to the element data
            m_node.data('_mapLayer', layer);

            // initialize groups
            m_node.data('_mapGroups', {});
            
            // attach resize handler
            $(window).resize(resize);
            m_node.resize(resize);

            // connect the layers together
            map.addLayer(osm)
               .addLayer(layer);

            // perform the initial resize
            resize();

            return this;
        });

        return this;
    }

    // get a marker group, create a new one, or set options
    function getSetGroup (id, opts) {
        var m_node = $(this),
            layer = m_node.data('_mapLayer'),
            groups = m_node.data('_mapGroups');


        // group does not exist, make a new one
        if (!groups.hasOwnProperty(id)) {
            groups[id] = new GeoApplicationGroup(id, layer, m_node);
            m_node.data('_mapGroups', groups);
        }

        // set if opts is defined
        if (opts !== undefined && id !== undefined) {
            
            if (opts.data) {
                m_node.data(id).data = [];
            }

            $.extend(true, m_node.data(id), opts);

            return this;
        }

        // return a group's options
        return $.extend(true, m_node.data(id));
    }

    $.fn.geojsMap = function (arg1, arg2, arg3) {
        var r; 
        if (arg1 === 'group') {
            r = getSetGroup.call(this, arg2, arg3);
        } else {
            r = initialize.call(this, arg1);
        }

        return r;
    };
}(window.$, window.geo, window.d3));
/*jslint browser: true, nomen: true, unparam: true*/

(function ($, d3) {
    'use strict';

    var map, threshold = 0.5;

    function opacity(d) {
        return 1.0;
    }

    function makePopOver(node, data) {
        var msg = [];
        msg.push('<b>Summary:</b> ' + data.properties.summary);
        msg.push('<b>Date:</b> ' + data.properties.date.toString());
        msg.push('<b>Location:</b> ' + data.properties.country);
        msg.push('<b>Disease:</b> ' + data.properties.disease);
        msg.push('<b>Symptoms:</b> ' + data.properties.symptoms.join(', '));
        msg.push('<b>Species:</b> ' + data.properties.species);
        msg.push('<b>Similarity:</b> ' + data.properties.score.toFixed(2));
        $(node).popover({
            html: true,
            container: 'body',
            placement: 'auto top',
            trigger: 'manual',
            content: msg.join('<br>\n')
        });
    }

    function update(args) {
        var data = args.data,
            dataStart = args.dataEnd,
            dataEnd = args.dataStart;
        
        data.forEach(function (d) {
            if (d.properties.date < dataStart) {
                dataStart = d.properties.date;
            }
            if (d.properties.date > dataEnd) {
                dataEnd = d.properties.date;
            }
        });

        var cscale = colorbrewer.PuBu[3],
            midDate = new Date((dataStart.valueOf() + dataEnd.valueOf()) / 2),
            color = d3.scale.linear().domain([dataStart, midDate, dataEnd]).range(cscale).clamp(true);
        map.geojsMap('group', 'points', {
            lat: function (d) { return d.geometry.coordinates[1]; },
            lng: function (d) { return d.geometry.coordinates[0]; },
            r: function (d) {
                return '5pt';
            },
            data: data,
            dataIndexer: function (d) {
                return d.properties.id;
            },
            style: {
                fill: function (d) {
                    if (d.properties.id ===  args.target.properties.id) {
                        return 'red';
                    }
                    return color(d.properties.date);
                },
                'fill-opacity': opacity,
                'stroke-opacity': opacity,
                'stroke': 'black',
                'stroke-width': '0.5pt',
                'pointer-events': 'auto'
            },
            handlers: {
                'click': function (d) {
                    console.log(d);
                },
                'mouseover': function () {
                    $(this).popover('show');
                },
                'mouseout': function () {
                    $(this).popover('hide');
                }
            },
            enter: {
                each: function (d) {
                    var link = d3.select(this.parentNode).append('svg:a')
                        .attr('xlink:href', d.properties.link)
                        .attr('target', 'healthMapInfo');
                    $(link.node()).prepend(this);
                    makePopOver(this, d);
                }
            },
            exit: {
                each: function (d) {
                    $(this).parent().remove();
                }
            },
            filter: function (d) {
                return d.properties.score > threshold;
            }

        }).trigger('draw');
    }

    var node = '#geomap';

    Template.geomap.rendered = function () {
        if (!this.initialized) {
            map = $(node).geojsMap({'zoom': 3});
            $(map).on('datachanged', function (evt, args) {
                threshold = args.threshold;
                update(args);
            });
            this.initialized = true;
        }
    };
}(window.$, window.d3));
