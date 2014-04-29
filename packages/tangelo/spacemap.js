/*jslint browser: true, nomen: true */

(function (tangelo, $, d3, google) {
    "use strict";

    if (!($ && $.widget && d3)) {
        $.fn.nodelink = tangelo.unavailable({
            plugin: "nodelink",
            required: ["JQuery", "JQuery UI", "d3"]
        });
        return;
    }

    tangelo.widget("tangelo.spacemap", {
        options: {
            data: [],
            constraints: [],
            linkDistance: 20,
            charge: -30,
            gravity: 0.1,
            label: tangelo.accessor({value: ""}),
            width: $(window).width(),
            height: $(window).height()
        },

        _create: function () {
            var options,
                mapConfig,
                mapOptions,
                that = this;

            this.force = d3.layout.force();

            mapConfig = {
                initialize: function (svg) {
                    that.svg = d3.select(svg);
                    that._update();
                },

                draw: function (d) {
                    this.shift(that.svg.node(), -d.translation.x, -d.translation.y);
                    that.nodes.forEach(function(node) {
                        var loc, googleLoc, pixelLoc;
                        if (node.constraint && node.constraint.type === "map") {
                            loc = node.constraint.accessor(node.data);
                            googleLoc = new google.maps.LatLng(loc.lat, loc.lng);
                            pixelLoc = d.projection.fromLatLngToContainerPixel(googleLoc);
                            node.mapX = pixelLoc.x;
                            node.mapY = pixelLoc.y;
                        }
                    });
                    that.force.start();
                    that._tick();
                }
            };

            // Some options for initializing the google map.
            mapOptions = {
                zoom: 2,
                center: new google.maps.LatLng(15, 0),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            // this.map = new tangelo.GoogleMapSVG(this.element.get(0), mapOptions, mapConfig);
            // this.map.on(["draw", "drag", "zoom_changed"], mapConfig.draw);
            this.svg = d3.select(this.element.get(0)).append("svg").style("width", "100%").style("height", "100%");
            this.linkLayer = this.svg.append("g");
            this.nodeLayer = this.svg.append("g");
            this.nodeLabelLayer = this.svg.append("g");

            options = $.extend(true, {}, this.options);
            options.data = this.options.data;
            delete options.disabled;
            delete options.create;
            this._setOptions(options);
            this._update();

            function resize() {
                that._setOptions({width: that.element.width(), height: that.element.height()});
            }
            $(window).resize(resize);
            resize();

        },

        _update: function () {
            var that = this,
                dataNodes = [],
                colorScale,
                nodeEnter,
                nodeLabelEnter,
                oldNodes = this.nodes,
                sortedNodes,
                i,
                fontSize;

            if (!this.svg) {
                return;
            }

            this.nodes = [];
            this.links = [];
            this.mapOpacity = 0;

            this.options.data.forEach(function (d) {
                var node = {data: d, degree: 0};
                that.nodes.push(node);
                dataNodes.push(node);
            });

            this.options.constraints.forEach(function (constraint, i) {
                var scale, xScale, yScale;

                constraint.nodeMap = {};
                constraint.index = i;

                if (constraint.type === "x") {
                    scale = d3.scale.linear()
                        .domain(d3.extent(that.options.data, constraint.accessor))
                        .range([0, that.options.width]);
                    constraint.constrain = function (d) {
                        d.x = scale(constraint.accessor(d.data));
                    };
                } else if (constraint.type === "y") {
                    scale = d3.scale.linear()
                        .domain(d3.extent(that.options.data, constraint.accessor))
                        .range([0, that.options.height]);
                    constraint.constrain = function (d) {
                        d.y = scale(constraint.accessor(d.data));
                    };
                } else if (constraint.type === "ordinalx") {
                    scale = d3.scale.ordinal()
                        .domain(that.options.data.map(constraint.accessor))
                        .rangePoints([0, that.options.width], 1);
                    constraint.constrain = function (d) {
                        d.x = scale(constraint.accessor(d.data));
                    };
                } else if (constraint.type === "ordinaly") {
                    scale = d3.scale.ordinal()
                        .domain(that.options.data.map(constraint.accessor))
                        .rangePoints([0, that.options.height], 1);
                    constraint.constrain = function (d) {
                        d.y = scale(constraint.accessor(d.data));
                    };
                } else if (constraint.type === "xy") {
                    xScale = d3.scale.linear()
                        .domain(d3.extent(that.options.data, function (d) {
                            return constraint.accessor(d).x;
                        }))
                        .range([0, that.options.width]);
                    yScale = d3.scale.linear()
                        .domain(d3.extent(that.options.data, function (d) {
                            return constraint.accessor(d).y;
                        }))
                        .range([0, that.options.height]);
                    constraint.constrain = function (d) {
                        d.x = xScale(constraint.accessor(d.data).x);
                        d.y = yScale(constraint.accessor(d.data).y);
                    };
                } else if (constraint.type === "map") {
                    that.mapOpacity = Math.max(that.mapOpacity, constraint.strength);
                    constraint.constrain = function (d) {
                        d.x = d.mapX;
                        d.y = d.mapY;
                    };
                } else if (constraint.type === "link") {
                    constraint.constrain = function () {};
                }
                dataNodes.forEach(function (node) {
                    var values = constraint.accessor(node.data),
                        i,
                        value,
                        constraintNode;
                    if (!tangelo.isArray(values)) {
                        values = [values];
                    }
                    for (i = 0; i < values.length; i += 1) {
                        value = values[i];
                        if (!tangelo.isString(value)) {
                            value = JSON.stringify(value);
                        }
                        if (constraint.type === "link") {
                            if (!constraint.nodeMap[value]) {
                                constraint.nodeMap[value] = {data: node.data, value: value, constraint: constraint, degree: 0};
                                that.nodes.push(constraint.nodeMap[value]);
                            }
                            that.links.push({source: node, target: constraint.nodeMap[value]});
                            node.degree += 1;
                            constraint.nodeMap[value].degree += 1;
                        } else {
                            constraintNode = {data: node.data, value: value, constraint: constraint, degree: 0};
                            that.nodes.push(constraintNode);
                            that.links.push({source: node, target: constraintNode});
                            node.degree += 1;
                            constraintNode.degree += 1;
                        }
                    }
                });
            });

            // Copy over x,y locations from old nodes
            if (oldNodes) {
                for (i = 0; i < this.nodes.length && i < oldNodes.length; i += 1) {
                    this.nodes[i].x = oldNodes[i].x;
                    this.nodes[i].y = oldNodes[i].y;
                }
            }

            fontSize = d3.scale.linear().domain(d3.extent(this.nodes, function (d) { return d.constraint && d.constraint.strength === 0 ? 0 : d.degree; })).range([8, 32]);

            colorScale = d3.scale.category10();
            this.nodes.forEach(function (d) {
                colorScale(d.constraint ? d.constraint.index : -1);
            });

            sortedNodes = this.nodes.slice();
            sortedNodes.sort(function (a, b) { return d3.ascending(a.degree, b.degree); });

            this.force
                .linkDistance(this.options.linkDistance)
                .linkStrength(function (link) {
                    return link.target.constraint.strength;
                })
                .charge(this.options.charge)
                .gravity(this.options.gravity)
                //.chargeDistance(20)
                .theta(0.1)
                .size([this.options.width, this.options.height])
                .nodes(this.nodes)
                .links(this.links)
                .start();

            this.nodeLayer.selectAll("*").remove();
            this.linkLayer.selectAll("*").remove();
            this.nodeLabelLayer.selectAll("*").remove();

            this.link = this.linkLayer.selectAll(".link")
                .data(this.links);

            this.link.enter()
                .append("line")
                .classed("link", true)
                .style("opacity", function (d) { return d.target.constraint.strength / 2; })
                .style("stroke", "#999")
                .style("stroke-width", 1);

            this.node = this.nodeLayer.selectAll(".node")
                .data(sortedNodes);

            nodeEnter = this.node.enter()
                .append("g")
                .classed("node", true)
                .call(this.force.drag);
            nodeEnter.append("circle")
                .style("stroke", "#fff")
                .style("stroke-width", 0.5);

            this.nodeLabel = this.nodeLabelLayer.selectAll(".node-label")
                .data(sortedNodes);

            nodeLabelEnter = this.nodeLabel.enter()
                .append("g")
                .classed("node-label", true);
            nodeLabelEnter.append("text")
                .style("text-anchor", "middle")
                .style("font-weight", "bold")
                .style("stroke", "white")
                .style("stroke-width", 1)
                .style("stroke-opacity", 0.5)
                .style("fill", function (d) { return d3.rgb(colorScale(d.constraint ? d.constraint.index : -1)).darker(2); })
                .attr("dy", ".3em")
                .text(function (d) {
                    if (d.constraint) {
                        if (d.constraint.type === "link" ||
                                d.constraint.type === "ordinalx" ||
                                d.constraint.type === "ordinaly") {
                            return d.value;
                        }
                        return "";
                    }
                    return that.options.label(d);
                });

            this.node
                .style("opacity", function (d) { return d.constraint ? d.constraint.strength : 1; });

            this.link
                .style("opacity", function (d) { return d.target.constraint ? d.target.constraint.strength : 1; });

            this.nodeLabel
                .style("opacity", function (d) { return d.constraint ? d.constraint.strength : 1; });

            this.nodeLabel.selectAll("text")
                .style("font-size", function (d) { return d.constraint ? d.constraint.strength * fontSize(d.degree) : fontSize(d.degree); });

            this.node.selectAll("circle")
                .attr("r", function (d) { return d.constraint ? 4 : 6; })
                .style("stroke", "black")
                .style("fill", function (d) { return colorScale(d.constraint ? d.constraint.index : -1); });

            this.force.on("tick", function () { that._tick.call(that); });

            this.force.resume();
            // this.map.trigger("draw");
        },

        _tick: function() {
            var that = this;

            $(this.element.get(0)).find("img").css('opacity', this.mapOpacity);

            that.nodes.forEach(function (node) {
                if (node.constraint) {
                    node.constraint.constrain(node);
                }
            });

            that.link.attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            that.node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
            that.nodeLabel.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
        }
    });
}(window.tangelo, window.jQuery, window.d3, window.google));
