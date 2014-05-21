/*jslint browser: true, unparam: true*/
/*global d3, $, Template*/
(function () {
    var root = {},
        duration = 500;


    function load(callBack) {
        d3.json('../data/decision_tree.json', function (err, data) {
            root = data;
            callBack();
        });
    }

    var node = '#dendrogram';

    function processTree (root) {
        root.symptom = root.symptom.name;
        root.collapse = true;
        if (Array.isArray(root.symptom)) {
            root.symptom = root.symptom.join(', ');
        }
        root.symptom = root.symptom.toLowerCase();
        if (root.children && root.children.length) {
            root.disease = false;
            root._children = root.children.slice();

            root._children[0].labelPosition = 'above';
            root._children[1].labelPosition = 'below';

            processTree(root.children[0]);
            processTree(root.children[1]);
        } else {
            root._children = [];
            root.disease = root.symptom;
            root.symptom = null;
        }
    }

    function calculate (root, target, distance) {
        distance = distance || 0;
        root.distance = distance;
        root.collapse = root.collapse && !!distance;

        if (root._children && root._children.length) {

            if (target.symptoms.indexOf(root.symptom) >= 0) {
                calculate(root._children[0], target, distance + 1);
                calculate(root._children[1], target, distance);
            } else if (target.unknown.indexOf(root.symptom) >= 0) {
                calculate(root._children[0], target, distance);
                calculate(root._children[1], target, distance);
            } else {
                calculate(root._children[0], target, distance);
                calculate(root._children[1], target, distance + 1);
            }
        }
    }

    function lineWidth (d, target) {
        if (!d.target.distance) {
            return 1.5;
        }
        return 0.5;
    }

    function nodeColor(d, target) {
        if (!d.distance) {
            if (!d.disease) {
                if (target.symptoms.indexOf(d.symptom) >= 0) {
                    return 'green';
                }
                if (target.unknown.indexOf(d.symptom) >= 0) {
                    return 'yellow';
                }
                return 'red';
            }
            return 'black';
        }
        if (!d.disease) {
            return 'blue';
        }
        return 'white';
    }

    function draw(target) {
        calculate(root, target);

        var lineWidthForTarget = function (d) {
            return lineWidth(d, target);
        };
        var nodeColorForTarget = function (d) {
            return nodeColor(d, target);
        };
        $(node).dendrogram({
            margin: {
                top: 25,
                bottom: 50,
                left: 50,
                right: 50
            },
            data: root,
            expanded: function (d) {
                return !d.distance || !d.collapse;
            },
            nodeColor: nodeColorForTarget,
            lineWidth: lineWidthForTarget,
            on: {
                click: function (d) {
                    var i, j;
                    if (!d.distance) {
                        i = target.symptoms.indexOf(d.symptom);
                        j = target.unknown.indexOf(d.symptom);
                        if (i >= 0) {
                            target.symptoms.splice(i, 1);
                            target.unknown.push(d.symptom);
                        } else if (j >= 0) {
                            target.unknown.splice(j, 1);
                        } else {
                            target.symptoms.push(d.symptom);
                        }
                        calculate(root, target);
                        return false;
                    }
                    return true;
                }
            },
            label: function (d) {
                return d.symptom || d.disease;
            },
            labelPosition: function (d) {
                return d.labelPosition;
            }
        });
    }

    function init() {
        root.labelPosition = 'above';
        processTree(root);
        var target = {
            symptoms: Session.get('features') || [],
            unknown: []
        };
        draw(target);
        $(node).on('resizeApp', function (evt, obj) {
            $(node)
              .dendrogram({'duration': 0})
              .dendrogram(obj)
              .dendrogram({'duration': duration});
        });
    }

    Template.dendrogram.rendered = function () {
        if (!this.initialized) {
            load(init);
        } else {
            var target = {
                symptoms: Session.get('features') || [],
                unknown: []
            };
            draw(target);
        }
    };

    Deps.autorun(function () {
        var target = {
            symptoms: Session.get('features') || [],
            unknown: []
        };
        draw(target);
    });

}());
