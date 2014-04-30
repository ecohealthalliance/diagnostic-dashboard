/*jslint browser: true, unparam: true*/
/*global d3, $, Template*/
(function () {
    var root = {},
        target = {
            symptoms: ["myalgia", "diarrhea", "headache", "skin rash", "eosinophilia"],
            unknown: []
        };

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
            processTree(root.children[0]);
            processTree(root.children[1]);
        } else {
            root._children = [];
            root.disease = root.symptom;
            root.symptom = null;
        }
    }

    function calculate (root, distance) {
        distance = distance || 0;
        root.distance = distance;
        root.collapse = root.collapse && !!distance;

        if (root._children.length) {

            if (target.symptoms.indexOf(root.symptom) >= 0) {
                calculate(root._children[0], distance + 1);
                calculate(root._children[1], distance);
            } else if (target.unknown.indexOf(root.symptom) >= 0) {
                calculate(root._children[0], distance);
                calculate(root._children[1], distance);
            } else {
                calculate(root._children[0], distance);
                calculate(root._children[1], distance + 1);
            }
        }
    }

    function lineWidth (d) {
        if (!d.target.distance) {
            return 1.5;
        }
        return 0.5;
    }

    function nodeColor(d) {
        if (!d.distance) {
            if (!d.disease) {
                if (target.symptoms.indexOf(d.symptom) >= 0) {
                    return 'red';
                }
                if (target.unknown.indexOf(d.symptom) >= 0) {
                    return 'yellow';
                }
                return 'green';
            }
            return 'black';
        }
        if (!d.disease) {
            return 'blue';
        }
        return 'white';
    }

    function draw() {
        calculate(root);
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
            nodeColor: nodeColor,
            lineWidth: lineWidth,
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
                        calculate(root);
                        return false;
                    }
                    return true;
                }
            },
            label: function (d) {
                return d.symptom || d.disease;
            },
            labelPosition: function (d) {
                return d.disease ? 'below' : 'above';
            }
        });
    }

    function init() {
        processTree(root);
        draw();
    }

    Template.dendrogram.rendered = function () {
        if (!this.initialized) {
            load(init);
        } else {
            draw();
        }
    };

    $(node).parent().resize(function () {
        $(node).dendrogram('resize');
    });
}());
