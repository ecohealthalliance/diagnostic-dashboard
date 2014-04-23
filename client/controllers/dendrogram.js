var getChildren = function (node) {
    return [].concat(node.children && node.children[0] ? getChildren(node.children[0]) : [],
                     tangelo.isArray(node.symptom.name) ? node.symptom.name : [],
                     node.children && node.children[1] ? getChildren(node.children[1]) : []);
};

Template.dendrogram.rendered = function () {

    var node = $('#dendrogram');
    d3.json("data/decision_tree.json", function (err, data) {
        var symptoms,
            qargs;

        if (err) {
            console.log(err);
            return;
        }

        function defaultColor(node) {
            node.color = "lightsteelblue";
            $.each(node.children, function (i, v) {
                defaultColor(v);
            });
        }
        defaultColor(data);

        function followPath(node, symptoms) {
            var way;

            if (Object.keys(symptoms).length === 0) {
                return;
            }

            if (!node.children || node.children.length === 0) {
                node.color = "red";
            } else {
                node.color = "pink";

                way = symptoms.hasOwnProperty(node.symptom.name.toLowerCase()) ? 0 : 1;
                followPath(node.children[way], symptoms);
            }
        }

        function restoreDefaultColor(node) {
            if (node.collapsed) {
                node.color = "blue";
            } else {
                node.color = "lightsteelblue";
            }

            if (node.children) {
                $.each(node.children, function (i, v) {
                    restoreDefaultColor(v);
                });
            }
        }

        qargs = tangelo.queryArguments();
        if (qargs.hasOwnProperty("symptoms")) {
            symptoms = {};
            $.each(qargs.symptoms.split(",").map(function (s) {
                return s.toLowerCase();
            }), function (_, v) {
                symptoms[v] = true;
            });

            followPath(data, symptoms);
        }

        $(node).dendrogramLocal({
            data: data,
            orientation: "vertical",
            id: {field: "id"},
            textsize: 14,
            nodesize: 5,
            nodeColor: {field: "color"},
            hoverNodeColor: {value: "firebrick"},
            collapsedNodeColor: {value: "blue"},
            onNodeCreate: function (d) {
                var left,
                    right,
                    html;

                if (!tangelo.isArray(d.symptom.name)) {
                    left = d.children && d.children[0] ? getChildren(d.children[0]) : [];
                    right = d.children && d.children[1] ? getChildren(d.children[1]) : [];

                    html = "<p><b>Symptom: </b>" + d.symptom.name + "</p>";
                    html += "<p><b>Disease count: </b>" + (left.length + right.length) + "</p>";
                    html += "<p><b>Present: </b>" + left.join(", ") + "</p>";
                    html += "<p><b>Absent: </b>" + right.join(", ") + "</p>";
                } else {
                    html = "<p><b>Diseases: </b>" + d.symptom.name.join(", ") + "</p>";
                }

                $(this).popover({
                    animation: true,
                    html: true,
                    placement: $(node).dendrogramLocal("option", "orientation") === "horizontal" ? "auto right" : "auto bottom",
                    trigger: "manual",
                    content: html,
                    container: "body"
                });

                d3.select(this)
                    .on("click.popover", function (d) {
                        if (d3.event.shiftKey) {
                            $(this).popover("hide");
                        } else {
                            $(this).popover("toggle");
                        }
                    });
            },
            onNodeDestroy: function (d) {
                $(this).popover("destroy");
            }
        });

        $(node).dendrogramLocal("on", "click.collapse", function (d, i, elt) {
            if (d3.event.shiftKey) {
                this.action("collapse").call(elt, d, i);
            }
        });

        $(node).on("datachanged", function (e) {
            var symptomsLocal = $(arguments).toArray().slice(1);
            restoreDefaultColor($(node).dendrogramLocal("option", "data"));
            followPath($(node).dendrogramLocal("option", "data"), symptomsLocal);
            $(node).dendrogramLocal("refresh");
        }).resize($(node).dendrogramLocal("refresh"));
    });
};

Deps.autorun(function () {
   var symptoms = Session.get('symptoms');
   $('#dendrogram').trigger('datachanged', symptoms);
});
