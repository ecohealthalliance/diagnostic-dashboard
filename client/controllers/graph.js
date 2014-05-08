function shuffle(a) {

    function swap(i, j) {
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    };

    // return a randomly shuffled copy of 'a'
    var b = a.slice();
    b.forEach(function (d, i) {
        var j = Math.floor(Math.random() * b.length);
        swap(i, j);
    });
    return b;
};

Template.graph.rendered = function () {
    var node = $('#graph');
    var spacemap,
        constraints = [],
        dataStack = [],
        currentData,
        spacemapInitialized = false,
        maxDataSize = 100;

    function updateData(data) {
        var fieldMap = {},
            fields = [];

        data = shuffle(data).slice(0, maxDataSize);
        currentData = data;

        // Discover fields
        data.forEach(function (d, i) {
            var field, subfield;
            for (field in d) {
                if (d.hasOwnProperty(field) && !fieldMap[field]) {
                    if (tangelo.isObject(d[field])) {
                        for (subfield in d[field]) {
                            if (d[field].hasOwnProperty(subfield) && !fieldMap[field + "." + subfield]) {
                                fieldMap[field + "." + subfield] = true;
                                fields.push(field + "." + subfield);
                            }
                        }
                    }
                    fieldMap[field] = true;
                    fields.push(field);
                }
            }
        });

        spacemap = $(node).spacemap({
            data: data,
            constraints: constraints
        }).data("spacemap");

        if (!spacemapInitialized) {
            spacemapInitialized = true;
        }
    }

    $(node).on('datachanged', function (evt, arg) {
        updateData(arg.data.filter(function (d) {
            return d.properties.score >= arg.threshold;
        }));
    }).
    on('resizeApp', function (evt, obj) {
        $(node).spacemap(obj);
    });


};
