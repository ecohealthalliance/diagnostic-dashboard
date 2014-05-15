/*jslint browser: true, nomen: true */

(function (tangelo, $, d3) {
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
                that = this;

            this.force = d3.layout.force();

            this.svg = d3.select(this.element.get(0)).append("svg");
            this.linkLayer = this.svg.append("g");
            this.nodeLayer = this.svg.append("g");
            this.nodeLabelLayer = this.svg.append("g");

            options = $.extend(true, {}, this.options);
            options.data = this.options.data;
            delete options.disabled;
            delete options.create;
            this._setOptions(options);
            this._update();


        },

        _update: function () {
            var that = this,
                dataNodes = [],
                colorScale,
                nodeEnter,
                nodeLabelEnter,
                oldNodes = this.nodes,
                sortedNodes,
                fontSize,
                i;

            if (!this.svg) {
                return;
            }
            this.svg.attr('width', this.options.width)
                    .attr('height', this.options.height);

            this.nodes = [];
            this.links = [];

            this.options.data.forEach(function (d) {
                var node = {data: d, degree: 0};
                that.nodes.push(node);
                dataNodes.push(node);
            });

            this.options.constraints.forEach(function (constraint, i) {
                var scale, xScale, yScale;

                constraint.nodeMap = {};
                constraint.index = i;

                if (constraint.type === "link") {
                    constraint.constrain = $.noop;
                } else {
                    tangelo.fatalError(
                        '$.spacemap()',
                        'Invalid constraint type "' + constraint.type + '"'
                    );
                }
                dataNodes.forEach(function (node) {
                    var values = constraint.accessor(node.data),
                        j,
                        value,
                        constraintNode;
                    if (!tangelo.isArray(values)) {
                        values = [values];
                    }
                    for (j = 0; j < values.length; j += 1) {
                        value = values[j];
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

            this.force.on("tick", function () {
                var tick = that._tick;
                tick.call(that);
            });

            this.force.resume();
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
}(window.tangelo, window.jQuery, window.d3));
