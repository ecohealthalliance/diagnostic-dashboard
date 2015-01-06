function inherit(C, P) {
    "use strict";
    var F = function() {};
    F.prototype = P.prototype, C.prototype = new F(), C.uber = P.prototype, C.prototype.constructor = C;
}

if ("undefined" == typeof ogs) var ogs = {};

ogs.namespace = function(ns_string) {
    "use strict";
    var i, parts = ns_string.split("."), parent = ogs;
    for ("ogs" === parts[0] && (parts = parts.slice(1)), i = 0; i < parts.length; i += 1) "undefined" == typeof parent[parts[i]] && (parent[parts[i]] = {}), 
    parent = parent[parts[i]];
    return parent;
};

var vgl = ogs.namespace("gl");

Object.size = function(obj) {
    "use strict";
    var size = 0, key = null;
    for (key in obj) obj.hasOwnProperty(key) && size++;
    return size;
}, vgl.GL = {
    ColorBufferBit: 16384,
    DepthBufferBit: 256
};

var m_globalModifiedTime = 0;

vgl.timestamp = function() {
    "use strict";
    if (!(this instanceof vgl.timestamp)) return new vgl.timestamp();
    var m_modifiedTime = 0;
    this.modified = function() {
        ++m_globalModifiedTime, m_modifiedTime = m_globalModifiedTime;
    }, this.getMTime = function() {
        return m_modifiedTime;
    };
}, vgl.object = function() {
    "use strict";
    if (!(this instanceof vgl.object)) return new vgl.object();
    var m_modifiedTime = vgl.timestamp();
    return m_modifiedTime.modified(), this.modified = function() {
        m_modifiedTime.modified();
    }, this.getMTime = function() {
        return m_modifiedTime.getMTime();
    }, this;
}, vgl.event = function() {
    "use strict";
    return this instanceof vgl.event ? (vgl.object.call(this), this) : new vgl.event();
}, inherit(vgl.event, vgl.object), vgl.event.keyPress = "vgl.event.keyPress", vgl.event.mousePress = "vgl.event.mousePress", 
vgl.event.mouseRelease = "vgl.event.mouseRelease", vgl.event.contextMenu = "vgl.event.contextMenu", 
vgl.event.configure = "vgl.event.configure", vgl.event.enable = "vgl.event.enable", 
vgl.event.mouseWheel = "vgl.event.mouseWheel", vgl.event.keyRelease = "vgl.event.keyRelease", 
vgl.event.middleButtonPress = "vgl.event.middleButtonPress", vgl.event.startInteraction = "vgl.event.startInteraction", 
vgl.event.enter = "vgl.event.enter", vgl.event.rightButtonPress = "vgl.event.rightButtonPress", 
vgl.event.middleButtonRelease = "vgl.event.middleButtonRelease", vgl.event.char = "vgl.event.char", 
vgl.event.disable = "vgl.event.disable", vgl.event.endInteraction = "vgl.event.endInteraction", 
vgl.event.mouseMove = "vgl.event.mouseMove", vgl.event.mouseOut = "vgl.event.mouseOut", 
vgl.event.expose = "vgl.event.expose", vgl.event.timer = "vgl.event.timer", vgl.event.leftButtonPress = "vgl.event.leftButtonPress", 
vgl.event.leave = "vgl.event.leave", vgl.event.rightButtonRelease = "vgl.event.rightButtonRelease", 
vgl.event.leftButtonRelease = "vgl.event.leftButtonRelease", vgl.event.click = "vgl.event.click", 
vgl.event.dblClick = "vgl.event.dblClick", vgl.boundingObject = function() {
    "use strict";
    if (!(this instanceof vgl.boundingObject)) return new vgl.boundingObject();
    vgl.object.call(this);
    var m_bounds = [ 0, 0, 0, 0, 0, 0 ], m_computeBoundsTimestamp = vgl.timestamp(), m_boundsDirtyTimestamp = vgl.timestamp();
    return m_computeBoundsTimestamp.modified(), m_boundsDirtyTimestamp.modified(), this.bounds = function() {
        return m_bounds;
    }, this.hasValidBounds = function(bounds) {
        return bounds[0] == Number.MAX_VALUE || bounds[1] == -Number.MAX_VALUE || bounds[2] == Number.MAX_VALUE || bounds[3] == -Number.MAX_VALUE || bounds[4] == Number.MAX_VALUE || bounds[5] == -Number.MAX_VALUE ? !1 : !0;
    }, this.setBounds = function(minX, maxX, minY, maxY, minZ, maxZ) {
        return this.hasValidBounds([ minX, maxX, minY, maxY, minZ, maxZ ]) ? (m_bounds[0] = minX, 
        m_bounds[1] = maxX, m_bounds[2] = minY, m_bounds[3] = maxY, m_bounds[4] = minZ, 
        m_bounds[5] = maxZ, this.modified(), m_computeBoundsTimestamp.modified(), !0) : void 0;
    }, this.resetBounds = function() {
        m_bounds[0] = Number.MAX_VALUE, m_bounds[1] = -Number.MAX_VALUE, m_bounds[2] = Number.MAX_VALUE, 
        m_bounds[3] = -Number.MAX_VALUE, m_bounds[4] = Number.MAX_VALUE, m_bounds[5] = -Number.MAX_VALUE, 
        this.modified();
    }, this.computeBounds = function() {}, this.computeBoundsTimestamp = function() {
        return m_computeBoundsTimestamp;
    }, this.boundsDirtyTimestamp = function() {
        return m_boundsDirtyTimestamp;
    }, this.resetBounds(), this;
}, vgl.boundingObject.ReferenceFrame = {
    Relative: 0,
    Absolute: 1
}, inherit(vgl.boundingObject, vgl.object), vgl.node = function() {
    "use strict";
    if (!(this instanceof vgl.node)) return new vgl.node();
    vgl.boundingObject.call(this);
    var m_parent = null, m_material = null, m_visible = !0, m_overlay = !1;
    return this.accept = function(visitor) {
        visitor.visit(this);
    }, this.material = function() {
        return m_material;
    }, this.setMaterial = function(material) {
        return material !== m_material ? (m_material = material, this.modified(), !0) : !1;
    }, this.visible = function() {
        return m_visible;
    }, this.setVisible = function(flag) {
        return flag !== m_visible ? (m_visible = flag, this.modified(), !0) : !1;
    }, this.parent = function() {
        return m_parent;
    }, this.setParent = function(parent) {
        return parent !== m_parent ? (null !== m_parent && m_parent.removeChild(this), m_parent = parent, 
        this.modified(), !0) : !1;
    }, this.overlay = function() {
        return m_overlay;
    }, this.setOverlay = function(flag) {
        return m_overlay !== flag ? (m_overlay = flag, this.modified(), !0) : !1;
    }, this.ascend = function() {}, this.traverse = function() {}, this.boundsModified = function() {
        this.boundsDirtyTimestamp().modified(), null !== m_parent && m_parent.boundsModified();
    }, this;
}, inherit(vgl.node, vgl.boundingObject), vgl.groupNode = function() {
    "use strict";
    if (!(this instanceof vgl.groupNode)) return new vgl.groupNode();
    vgl.node.call(this);
    var m_children = [];
    return this.b_setVisible = this.setVisible, this.setVisible = function(flag) {
        var i;
        if (this.b_setVisible(flag) !== !0) return !1;
        for (i = 0; i < m_children.length; ++i) m_children[i].setVisible(flag);
        return !0;
    }, this.addChild = function(childNode) {
        return childNode instanceof vgl.node && -1 === m_children.indexOf(childNode) ? (childNode.setParent(this), 
        m_children.push(childNode), this.boundsDirtyTimestamp().modified(), !0) : !1;
    }, this.removeChild = function(childNode) {
        if (childNode.parent() === this) {
            var index = m_children.indexOf(childNode);
            return m_children.splice(index, 1), this.boundsDirtyTimestamp().modified(), !0;
        }
    }, this.removeChildren = function() {
        var i;
        for (i = 0; i < m_children.length; ++i) this.removeChild(m_children[i]);
        this.modified();
    }, this.children = function() {
        return m_children;
    }, this.hasChild = function(node) {
        var i = 0, child = !1;
        for (i = 0; i < m_children.length; i++) if (m_children[i] === node) {
            child = !0;
            break;
        }
        return child;
    }, this.accept = function(visitor) {
        visitor.visit(this);
    }, this.traverse = function(visitor) {
        switch (visitor.type()) {
          case visitor.UpdateVisitor:
            this.traverseChildrenAndUpdateBounds(visitor);
            break;

          case visitor.CullVisitor:
            this.traverseChildren(visitor);
        }
    }, this.traverseChildrenAndUpdateBounds = function(visitor) {
        var i;
        if (this.m_parent && this.boundsDirtyTimestamp().getMTime() > this.computeBoundsTimestamp().getMTime() && this.m_parent.boundsDirtyTimestamp.modified(), 
        this.computeBounds(), visitor.mode() === visitor.TraverseAllChildren) for (i = 0; i < m_children.length(); ++i) m_children[i].accept(visitor), 
        this.updateBounds(m_children[i]);
        this.computeBoundsTimestamp().modified();
    }, this.traverseChildren = function(visitor) {
        var i;
        if (visitor.mode() === vgl.vesVisitor.TraverseAllChildren) for (i = 0; i < m_children.length(); ++i) m_children[i].accept(visitor);
    }, this.computeBounds = function() {
        var i = 0;
        if (!(this.computeBoundsTimestamp().getMTime() > this.boundsDirtyTimestamp().getMTime())) for (i = 0; i < m_children.length; ++i) this.updateBounds(m_children[i]);
    }, this.updateBounds = function(child) {
        if (!child.overlay()) {
            child.computeBounds();
            var i, bounds = this.bounds(), childBounds = child.bounds(), istep = 0, jstep = 0;
            for (i = 0; 3 > i; ++i) istep = 2 * i, jstep = 2 * i + 1, childBounds[istep] < bounds[istep] && (bounds[istep] = childBounds[istep]), 
            childBounds[jstep] > bounds[jstep] && (bounds[jstep] = childBounds[jstep]);
            this.setBounds(bounds[0], bounds[1], bounds[2], bounds[3], bounds[4], bounds[5]);
        }
    }, this;
}, inherit(vgl.groupNode, vgl.node), vgl.actor = function() {
    "use strict";
    if (!(this instanceof vgl.actor)) return new vgl.actor();
    vgl.node.call(this);
    var m_transformMatrix = mat4.create(), m_referenceFrame = vgl.boundingObject.ReferenceFrame.Relative, m_mapper = null;
    return this.matrix = function() {
        return m_transformMatrix;
    }, this.setMatrix = function(tmatrix) {
        tmatrix !== m_transformMatrix && (m_transformMatrix = tmatrix, this.modified());
    }, this.referenceFrame = function() {
        return m_referenceFrame;
    }, this.setReferenceFrame = function(referenceFrame) {
        return referenceFrame !== m_referenceFrame ? (m_referenceFrame = referenceFrame, 
        this.modified(), !0) : !1;
    }, this.mapper = function() {
        return m_mapper;
    }, this.setMapper = function(mapper) {
        mapper !== m_mapper && (m_mapper = mapper, this.boundsModified());
    }, this.accept = function() {}, this.ascend = function() {}, this.computeLocalToWorldMatrix = function() {}, 
    this.computeWorldToLocalMatrix = function() {}, this.computeBounds = function() {
        if (null === m_mapper || void 0 === m_mapper) return void this.resetBounds();
        var mapperBounds, minPt, maxPt, newBounds, computeBoundsTimestamp = this.computeBoundsTimestamp();
        (this.boundsDirtyTimestamp().getMTime() > computeBoundsTimestamp.getMTime() || m_mapper.boundsDirtyTimestamp().getMTime() > computeBoundsTimestamp.getMTime()) && (m_mapper.computeBounds(), 
        mapperBounds = m_mapper.bounds(), minPt = [ mapperBounds[0], mapperBounds[2], mapperBounds[4] ], 
        maxPt = [ mapperBounds[1], mapperBounds[3], mapperBounds[5] ], vec3.transformMat4(minPt, minPt, m_transformMatrix), 
        vec3.transformMat4(maxPt, maxPt, m_transformMatrix), newBounds = [ minPt[0] > maxPt[0] ? maxPt[0] : minPt[0], minPt[0] > maxPt[0] ? minPt[0] : maxPt[0], minPt[1] > maxPt[1] ? maxPt[1] : minPt[1], minPt[1] > maxPt[1] ? minPt[1] : maxPt[1], minPt[2] > maxPt[2] ? maxPt[2] : minPt[2], minPt[2] > maxPt[2] ? minPt[2] : maxPt[2] ], 
        this.setBounds(newBounds[0], newBounds[1], newBounds[2], newBounds[3], newBounds[4], newBounds[5]), 
        computeBoundsTimestamp.modified());
    }, this;
}, inherit(vgl.actor, vgl.node), vgl.freezeObject = function(obj) {
    "use strict";
    var freezedObject = Object.freeze(obj);
    return "undefined" == typeof freezedObject && (freezedObject = function(o) {
        return o;
    }), freezedObject;
}, vgl.defaultValue = function(a, b) {
    "use strict";
    return "undefined" != typeof a ? a : b;
}, vgl.defaultValue.EMPTY_OBJECT = vgl.freezeObject({}), vgl.geojsonReader = function() {
    "use strict";
    if (!(this instanceof vgl.geojsonReader)) return new vgl.geojsonReader();
    return this.readScalars = function(coordinates, geom, size_estimate, idx) {
        var array = null, s = null, r = null, g = null, b = null;
        "values" === this.m_scalarFormat && 4 === coordinates.length ? (s = coordinates[3], 
        array = geom.sourceData(vgl.vertexAttributeKeys.Scalar), array || (array = new vgl.sourceDataSf(), 
        this.m_scalarRange && array.setScalarRange(this.m_scalarRange[0], this.m_scalarRange[1]), 
        void 0 !== size_estimate && (array.data().length = size_estimate), geom.addSource(array)), 
        void 0 === size_estimate ? array.pushBack(s) : array.insertAt(idx, s)) : "rgb" === this.m_scalarFormat && 6 === coordinates.length && (array = geom.sourceData(vgl.vertexAttributeKeys.Color), 
        array || (array = new vgl.sourceDataC3fv(), void 0 !== size_estimate && (array.length = 3 * size_estimate), 
        geom.addSource(array)), r = coordinates[3], g = coordinates[4], b = coordinates[5], 
        void 0 === size_estimate ? array.pushBack([ r, g, b ]) : array.insertAt(idx, [ r, g, b ]));
    }, this.readPoint = function(coordinates) {
        var geom = new vgl.geometryData(), vglpoints = new vgl.points(), vglcoords = new vgl.sourceDataP3fv(), indices = new Uint16Array(1), x = null, y = null, z = null, i = null;
        for (geom.addSource(vglcoords), i = 0; 1 > i; i++) indices[i] = i, x = coordinates[0], 
        y = coordinates[1], z = 0, coordinates.length > 2 && (z = coordinates[2]), vglcoords.pushBack([ x, y, z ]), 
        this.readScalars(coordinates, geom);
        return vglpoints.setIndices(indices), geom.addPrimitive(vglpoints), geom.setName("aPoint"), 
        geom;
    }, this.readMultiPoint = function(coordinates) {
        var i, geom = new vgl.geometryData(), vglpoints = new vgl.points(), vglcoords = new vgl.sourceDataP3fv(), indices = new Uint16Array(coordinates.length), pntcnt = 0, estpntcnt = coordinates.length, x = null, y = null, z = null;
        for (vglcoords.data().length = 3 * estpntcnt, i = 0; i < coordinates.length; i++) indices[i] = i, 
        x = coordinates[i][0], y = coordinates[i][1], z = 0, coordinates[i].length > 2 && (z = coordinates[i][2]), 
        vglcoords.insertAt(pntcnt, [ x, y, z ]), this.readScalars(coordinates[i], geom, estpntcnt, pntcnt), 
        pntcnt++;
        return vglpoints.setIndices(indices), geom.addPrimitive(vglpoints), geom.addSource(vglcoords), 
        geom.setName("manyPoints"), geom;
    }, this.readLineString = function(coordinates) {
        var geom = new vgl.geometryData(), vglline = new vgl.lineStrip(), vglcoords = new vgl.sourceDataP3fv(), indices = [], i = null, x = null, y = null, z = null;
        for (vglline.setIndicesPerPrimitive(coordinates.length), i = 0; i < coordinates.length; i++) indices.push(i), 
        x = coordinates[i][0], y = coordinates[i][1], z = 0, coordinates[i].length > 2 && (z = coordinates[i][2]), 
        vglcoords.pushBack([ x, y, z ]), this.readScalars(coordinates[i], geom);
        return vglline.setIndices(indices), geom.addPrimitive(vglline), geom.addSource(vglcoords), 
        geom.setName("aLineString"), geom;
    }, this.readMultiLineString = function(coordinates) {
        var geom = new vgl.geometryData(), vglcoords = new vgl.sourceDataP3fv(), pntcnt = 0, estpntcnt = 2 * coordinates.length, i = null, j = null, x = null, y = null, z = null, indices = null, vglline = null, thisLineLength = null;
        for (vglcoords.data().length = 3 * estpntcnt, j = 0; j < coordinates.length; j++) {
            for (indices = [], vglline = new vgl.lineStrip(), thisLineLength = coordinates[j].length, 
            vglline.setIndicesPerPrimitive(thisLineLength), i = 0; thisLineLength > i; i++) indices.push(pntcnt), 
            x = coordinates[j][i][0], y = coordinates[j][i][1], z = 0, coordinates[j][i].length > 2 && (z = coordinates[j][i][2]), 
            vglcoords.insertAt(pntcnt, [ x, y, z ]), this.readScalars(coordinates[j][i], geom, 2 * estpntcnt, pntcnt), 
            pntcnt++;
            vglline.setIndices(indices), geom.addPrimitive(vglline);
        }
        return geom.setName("aMultiLineString"), geom.addSource(vglcoords), geom;
    }, this.readPolygon = function(coordinates) {
        var geom = new vgl.geometryData(), vglcoords = new vgl.sourceDataP3fv(), x = null, y = null, z = null, thisPolyLength = coordinates[0].length, vl = 1, i = null, indices = null, vgltriangle = null;
        for (i = 0; thisPolyLength > i; i++) x = coordinates[0][i][0], y = coordinates[0][i][1], 
        z = 0, coordinates[0][i].length > 2 && (z = coordinates[0][i][2]), vglcoords.pushBack([ x, y, z ]), 
        this.readScalars(coordinates[0][i], geom), i > 1 && (indices = new Uint16Array([ 0, vl, i ]), 
        vgltriangle = new vgl.triangles(), vgltriangle.setIndices(indices), geom.addPrimitive(vgltriangle), 
        vl = i);
        return geom.setName("POLY"), geom.addSource(vglcoords), geom;
    }, this.readMultiPolygon = function(coordinates) {
        var geom = new vgl.geometryData(), vglcoords = new vgl.sourceDataP3fv(), ccount = 0, numPolys = coordinates.length, pntcnt = 0, estpntcnt = 3 * numPolys, vgltriangle = new vgl.triangles(), indexes = [], i = null, j = null, x = null, y = null, z = null, thisPolyLength = null, vf = null, vl = null, flip = null, flipped = !1, tcount = 0;
        for (vglcoords.data().length = 3 * numPolys, j = 0; numPolys > j; j++) for (thisPolyLength = coordinates[j][0].length, 
        vf = ccount, vl = ccount + 1, flip = [ !1, !1, !1 ], i = 0; thisPolyLength > i; i++) x = coordinates[j][0][i][0], 
        y = coordinates[j][0][i][1], z = 0, coordinates[j][0][i].length > 2 && (z = coordinates[j][0][i][2]), 
        flipped = !1, x > 180 && (flipped = !0, x -= 360), 0 === i ? flip[0] = flipped : flip[1 + (i - 1) % 2] = flipped, 
        vglcoords.insertAt(pntcnt, [ x, y, z ]), this.readScalars(coordinates[j][0][i], geom, estpntcnt, pntcnt), 
        pntcnt++, i > 1 && (flip[0] === flip[1] && flip[1] === flip[2] && (indexes[3 * tcount + 0] = vf, 
        indexes[3 * tcount + 1] = vl, indexes[3 * tcount + 2] = ccount, tcount++), vl = ccount), 
        ccount++;
        return vgltriangle.setIndices(indexes), geom.addPrimitive(vgltriangle), geom.setName("aMultiPoly"), 
        geom.addSource(vglcoords), geom;
    }, this.readGJObjectInt = function(object) {
        if (!object.hasOwnProperty("type")) return null;
        object.properties && object.properties.ScalarFormat && "values" === object.properties.ScalarFormat && (this.m_scalarFormat = "values", 
        object.properties.ScalarRange && (this.m_scalarRange = object.properties.ScalarRange)), 
        object.properties && object.properties.ScalarFormat && "rgb" === object.properties.ScalarFormat && (this.m_scalarFormat = "rgb");
        var ret, type = object.type, next = null, nextset = null, i = null;
        switch (type) {
          case "Point":
            ret = this.readPoint(object.coordinates);
            break;

          case "MultiPoint":
            ret = this.readMultiPoint(object.coordinates);
            break;

          case "LineString":
            ret = this.readLineString(object.coordinates);
            break;

          case "MultiLineString":
            ret = this.readMultiLineString(object.coordinates);
            break;

          case "Polygon":
            ret = this.readPolygon(object.coordinates);
            break;

          case "MultiPolygon":
            ret = this.readMultiPolygon(object.coordinates);
            break;

          case "GeometryCollection":
            for (nextset = [], i = 0; i < object.geometries.length; i++) next = this.readGJObject(object.geometries[i]), 
            nextset.push(next);
            ret = nextset;
            break;

          case "Feature":
            next = this.readGJObject(object.geometry), ret = next;
            break;

          case "FeatureCollection":
            for (nextset = [], i = 0; i < object.features.length; i++) next = this.readGJObject(object.features[i]), 
            nextset.push(next);
            ret = nextset;
            break;

          default:
            console.log("Don't understand type " + type), ret = null;
        }
        return ret;
    }, this.readGJObject = function(object) {
        var ret;
        return ret = this.readGJObjectInt(object);
    }, this.linearizeGeoms = function(geoms, geom) {
        var i = null;
        if ("[object Array]" === Object.prototype.toString.call(geom)) for (i = 0; i < geom.length; i++) this.linearizeGeoms(geoms, geom[i]); else geoms.push(geom);
    }, this.readGeomObject = function(object) {
        var geom, geoms = [];
        return geom = this.readGJObject(object), this.linearizeGeoms(geoms, geom), geoms;
    }, this.getPrimitives = function(buffer) {
        if (!buffer) return [];
        var obj = JSON.parse(buffer), geom = this.readGJObject(obj), geoms = [];
        return this.m_scalarFormat = "none", this.m_scalarRange = null, this.linearizeGeoms(geoms, geom), 
        {
            geoms: geoms,
            scalarFormat: this.m_scalarFormat,
            scalarRange: this.m_scalarRange
        };
    }, this;
}, vgl.data = function() {
    "use strict";
    return this instanceof vgl.data ? void (this.type = function() {}) : new vgl.data();
}, vgl.data.raster = 0, vgl.data.point = 1, vgl.data.lineString = 2, vgl.data.polygon = 3, 
vgl.data.geometry = 10;

var vertexAttributeKeys = {
    Position: 0,
    Normal: 1,
    TextureCoordinate: 2,
    Color: 3,
    Scalar: 4
};

vgl.primitive = function() {
    "use strict";
    if (!(this instanceof vgl.primitive)) return new vgl.primitive();
    var m_indicesPerPrimitive = 0, m_primitiveType = 0, m_indicesValueType = 0, m_indices = null;
    return this.indices = function() {
        return m_indices;
    }, this.createIndices = function() {
        m_indices = new Uint16Array();
    }, this.numberOfIndices = function() {
        return m_indices.length;
    }, this.sizeInBytes = function() {
        return m_indices.length * Uint16Array.BYTES_PER_ELEMENT;
    }, this.primitiveType = function() {
        return m_primitiveType;
    }, this.setPrimitiveType = function(type) {
        m_primitiveType = type;
    }, this.indicesPerPrimitive = function() {
        return m_indicesPerPrimitive;
    }, this.setIndicesPerPrimitive = function(count) {
        m_indicesPerPrimitive = count;
    }, this.indicesValueType = function() {
        return m_indicesValueType;
    }, this.setIndicesValueType = function(type) {
        m_indicesValueType = type;
    }, this.setIndices = function(indicesArray) {
        m_indices = new Uint16Array(indicesArray);
    }, this;
}, vgl.triangleStrip = function() {
    "use strict";
    return this instanceof vgl.triangleStrip ? (vgl.primitive.call(this), this.setPrimitiveType(gl.TRIANGLE_STRIP), 
    this.setIndicesValueType(gl.UNSIGNED_SHORT), this.setIndicesPerPrimitive(3), this) : new vgl.triangleStrip();
}, inherit(vgl.triangleStrip, vgl.primitive), vgl.triangles = function() {
    "use strict";
    return this instanceof vgl.triangles ? (vgl.primitive.call(this), this.setPrimitiveType(gl.TRIANGLES), 
    this.setIndicesValueType(gl.UNSIGNED_SHORT), this.setIndicesPerPrimitive(3), this) : new vgl.triangles();
}, inherit(vgl.triangles, vgl.primitive), vgl.lines = function() {
    "use strict";
    return this instanceof vgl.lines ? (vgl.primitive.call(this), this.setPrimitiveType(gl.LINES), 
    this.setIndicesValueType(gl.UNSIGNED_SHORT), this.setIndicesPerPrimitive(2), this) : new vgl.lines();
}, inherit(vgl.lines, vgl.primitive), vgl.lineStrip = function() {
    "use strict";
    return this instanceof vgl.lineStrip ? (vgl.primitive.call(this), this.setPrimitiveType(gl.LINE_STRIP), 
    this.setIndicesValueType(gl.UNSIGNED_SHORT), this.setIndicesPerPrimitive(2), this) : new vgl.lineStrip();
}, inherit(vgl.lineStrip, vgl.primitive), vgl.points = function() {
    "use strict";
    return this instanceof vgl.points ? (vgl.primitive.call(this), this.setPrimitiveType(gl.POINTS), 
    this.setIndicesValueType(gl.UNSIGNED_SHORT), this.setIndicesPerPrimitive(1), this) : new vgl.points();
}, inherit(vgl.points, vgl.primitive), vgl.vertexDataP3f = function() {
    "use strict";
    return this instanceof vgl.vertexDataP3f ? (this.m_position = [], this) : new vgl.vertexDataP3f();
}, vgl.vertexDataP3N3f = function() {
    "use strict";
    return this instanceof vgl.vertexDataP3N3f ? (this.m_position = [], this.m_normal = [], 
    this) : new vgl.vertexDataP3N3f();
}, vgl.vertexDataP3T3f = function() {
    "use strict";
    return this instanceof vgl.vertexDataP3T3f ? (this.m_position = [], this.m_texCoordinate = [], 
    this) : new vgl.vertexDataP3T3f();
}, vgl.sourceData = function() {
    "use strict";
    if (!(this instanceof vgl.sourceData)) return new vgl.sourceData();
    var m_attributesMap = {}, m_data = [], vglAttributeData = function() {
        this.m_numberOfComponents = 0, this.m_dataType = 0, this.m_dataTypeSize = 0, this.m_normalized = !1, 
        this.m_stride = 0, this.m_offset = 0;
    };
    return this.data = function() {
        return m_data;
    }, this.getData = function() {
        return data();
    }, this.setData = function(data) {
        return data instanceof Array ? void (m_data = data.slice(0)) : void console.log("[error] Requires array");
    }, this.addAttribute = function(key, dataType, sizeOfDataType, offset, stride, noOfComponents, normalized) {
        if (!m_attributesMap.hasOwnProperty(key)) {
            var newAttr = new vglAttributeData();
            newAttr.m_dataType = dataType, newAttr.m_dataTypeSize = sizeOfDataType, newAttr.m_offset = offset, 
            newAttr.m_stride = stride, newAttr.m_numberOfComponents = noOfComponents, newAttr.m_normalized = normalized, 
            m_attributesMap[key] = newAttr;
        }
    }, this.sizeOfArray = function() {
        return Object.size(m_data);
    }, this.lengthOfArray = function() {
        return m_data.length;
    }, this.sizeInBytes = function() {
        var i, sizeInBytes = 0, keys = this.keys();
        for (i = 0; i < keys.length(); ++i) sizeInBytes += this.numberOfComponents(keys[i]) * this.sizeOfAttributeDataType(keys[i]);
        return sizeInBytes *= this.sizeOfArray();
    }, this.hasKey = function(key) {
        return m_attributesMap.hasOwnProperty(key);
    }, this.keys = function() {
        return Object.keys(m_attributesMap);
    }, this.numberOfAttributes = function() {
        return Object.size(m_attributesMap);
    }, this.attributeNumberOfComponents = function(key) {
        return m_attributesMap.hasOwnProperty(key) ? m_attributesMap[key].m_numberOfComponents : 0;
    }, this.normalized = function(key) {
        return m_attributesMap.hasOwnProperty(key) ? m_attributesMap[key].m_normalized : !1;
    }, this.sizeOfAttributeDataType = function(key) {
        return m_attributesMap.hasOwnProperty(key) ? m_attributesMap[key].m_dataTypeSize : 0;
    }, this.attributeDataType = function(key) {
        return m_attributesMap.hasOwnProperty(key) ? m_attributesMap[key].m_dataType : void 0;
    }, this.attributeOffset = function(key) {
        return m_attributesMap.hasOwnProperty(key) ? m_attributesMap[key].m_offset : 0;
    }, this.attributeStride = function(key) {
        return m_attributesMap.hasOwnProperty(key) ? m_attributesMap[key].m_stride : 0;
    }, this.pushBack = function() {}, this.insert = function(data) {
        var i;
        if (data.length) for (i = 0; i < data.length; i++) m_data[m_data.length] = data[i]; else m_data[m_data.length] = data;
    }, this.insertAt = function(index, data) {
        var i;
        if (data.length) for (i = 0; i < data.length; i++) m_data[index * data.length + i] = data[i]; else m_data[index] = data;
    }, this;
}, vgl.sourceDataAnyfv = function(size, key) {
    return this instanceof vgl.sourceDataAnyfv ? (vgl.sourceData.call(this), this.addAttribute(key, gl.FLOAT, 4, 0, 4 * size, size, !1), 
    this.pushBack = function(value) {
        this.insert(value);
    }, this) : new vgl.sourceDataAnyfv(size, key);
}, inherit(vgl.sourceDataAnyfv, vgl.sourceData), vgl.sourceDataP3T3f = function() {
    "use strict";
    return this instanceof vgl.sourceDataP3T3f ? (vgl.sourceData.call(this), this.addAttribute(vgl.vertexAttributeKeys.Position, gl.FLOAT, 4, 0, 24, 3, !1), 
    this.addAttribute(vgl.vertexAttributeKeys.TextureCoordinate, gl.FLOAT, 4, 12, 24, 3, !1), 
    this.pushBack = function(value) {
        this.insert(value.m_position), this.insert(value.m_texCoordinate);
    }, this) : new vgl.sourceDataP3T3f();
}, inherit(vgl.sourceDataP3T3f, vgl.sourceData), vgl.sourceDataP3N3f = function() {
    "use strict";
    return this instanceof vgl.sourceDataP3N3f ? (vgl.sourceData.call(this), this.addAttribute(vgl.vertexAttributeKeys.Position, gl.FLOAT, 4, 0, 24, 3, !1), 
    this.addAttribute(vgl.vertexAttributeKeys.Normal, gl.FLOAT, 4, 12, 24, 3, !1), this.pushBack = function(value) {
        this.insert(value.m_position), this.insert(value.m_normal);
    }, this) : new vgl.sourceDataP3N3f();
}, inherit(vgl.sourceDataP3N3f, vgl.sourceData), vgl.sourceDataP3fv = function() {
    "use strict";
    return this instanceof vgl.sourceDataP3fv ? (vgl.sourceData.call(this), this.addAttribute(vgl.vertexAttributeKeys.Position, gl.FLOAT, 4, 0, 12, 3, !1), 
    this.pushBack = function(value) {
        this.insert(value);
    }, this) : new vgl.sourceDataP3fv();
}, inherit(vgl.sourceDataP3fv, vgl.sourceData), vgl.sourceDataT2fv = function() {
    "use strict";
    return this instanceof vgl.sourceDataT2fv ? (vgl.sourceData.call(this), this.addAttribute(vgl.vertexAttributeKeys.TextureCoordinate, gl.FLOAT, 4, 0, 8, 2, !1), 
    this.pushBack = function(value) {
        this.insert(value);
    }, this) : new vgl.sourceDataT2fv();
}, inherit(vgl.sourceDataT2fv, vgl.sourceData), vgl.sourceDataC3fv = function() {
    "use strict";
    return this instanceof vgl.sourceDataC3fv ? (vgl.sourceData.call(this), this.addAttribute(vgl.vertexAttributeKeys.Color, gl.FLOAT, 4, 0, 12, 3, !1), 
    this.pushBack = function(value) {
        this.insert(value);
    }, this) : new vgl.sourceDataC3fv();
}, inherit(vgl.sourceDataC3fv, vgl.sourceData), vgl.sourceDataSf = function() {
    "use strict";
    if (!(this instanceof vgl.sourceDataSf)) return new vgl.sourceDataSf();
    var m_min = null, m_max = null, m_fixedmin = null, m_fixedmax = null;
    return vgl.sourceData.call(this), this.addAttribute(vgl.vertexAttributeKeys.Scalar, gl.FLOAT, 4, 0, 4, 1, !1), 
    this.pushBack = function(value) {
        (null === m_max || value > m_max) && (m_max = value), (null === m_min || m_min > value) && (m_min = value), 
        this.data()[this.data().length] = value;
    }, this.insertAt = function(index, value) {
        (null === m_max || value > m_max) && (m_max = value), (null === m_min || m_min > value) && (m_min = value), 
        this.data()[index] = value;
    }, this.scalarRange = function() {
        return null === m_fixedmin || null === m_fixedmax ? [ m_min, m_max ] : [ m_fixedmin, m_fixedmax ];
    }, this.setScalarRange = function(min, max) {
        m_fixedmin = min, m_fixedmax = max;
    }, this;
}, inherit(vgl.sourceDataSf, vgl.sourceData), vgl.sourceDataDf = function() {
    "use strict";
    if (!(this instanceof vgl.sourceDataDf)) return new vgl.sourceDataDf();
    return vgl.sourceData.call(this), this.addAttribute(vgl.vertexAttributeKeys.Scalar, gl.FLOAT, 4, 0, 4, 1, !1), 
    this.pushBack = function(value) {
        this.data()[this.data().length] = value;
    }, this.insertAt = function(index, value) {
        this.data()[index] = value;
    }, this;
}, inherit(vgl.sourceDataDf, vgl.sourceData), vgl.geometryData = function() {
    "use strict";
    if (!(this instanceof vgl.geometryData)) return new vgl.geometryData();
    vgl.data.call(this);
    var m_name = "", m_primitives = [], m_sources = [], m_bounds = [ 0, 0, 0, 0, 0, 0 ], m_computeBoundsTimestamp = vgl.timestamp(), m_boundsDirtyTimestamp = vgl.timestamp();
    return this.type = function() {
        return vgl.data.geometry;
    }, this.name = function() {
        return m_name;
    }, this.setName = function(name) {
        m_name = name;
    }, this.addSource = function(source) {
        return -1 === m_sources.indexOf(source) ? (m_sources.push(source), source.hasKey(vgl.vertexAttributeKeys.Position) && m_boundsDirtyTimestamp.modified(), 
        !0) : !1;
    }, this.source = function(index) {
        return index < m_sources.length ? m_sources[index] : 0;
    }, this.numberOfSources = function() {
        return m_sources.length;
    }, this.sourceData = function(key) {
        var i;
        for (i = 0; i < m_sources.length; ++i) if (m_sources[i].hasKey(key)) return m_sources[i];
        return null;
    }, this.addPrimitive = function(primitive) {
        return m_primitives.push(primitive), !0;
    }, this.primitive = function(index) {
        return index < m_primitives.length ? m_primitives[index] : null;
    }, this.numberOfPrimitives = function() {
        return m_primitives.length;
    }, this.bounds = function() {
        return m_boundsDirtyTimestamp.getMTime() > m_computeBoundsTimestamp.getMTime() && this.computeBounds(), 
        m_bounds;
    }, this.resetBounds = function() {
        m_bounds[0] = 0, m_bounds[1] = 0, m_bounds[2] = 0, m_bounds[3] = 0, m_bounds[4] = 0, 
        m_bounds[5] = 0;
    }, this.setBounds = function(minX, maxX, minY, maxY, minZ, maxZ) {
        return m_bounds[0] = minX, m_bounds[1] = maxX, m_bounds[2] = minY, m_bounds[3] = maxY, 
        m_bounds[4] = minZ, m_bounds[5] = maxZ, m_computeBoundsTimestamp.modified(), !0;
    }, this.computeBounds = function() {
        if (m_boundsDirtyTimestamp.getMTime() > m_computeBoundsTimestamp.getMTime()) {
            var vertexIndex, j, attr = vgl.vertexAttributeKeys.Position, sourceData = this.sourceData(attr), data = sourceData.data(), numberOfComponents = sourceData.attributeNumberOfComponents(attr), stride = sourceData.attributeStride(attr), offset = sourceData.attributeOffset(attr), sizeOfDataType = sourceData.sizeOfAttributeDataType(attr), count = data.length, ib = 0, jb = 0, value = null;
            for (stride /= sizeOfDataType, offset /= sizeOfDataType, this.resetBounds(), vertexIndex = offset; count > vertexIndex; vertexIndex += stride) for (j = 0; numberOfComponents > j; ++j) value = data[vertexIndex + j], 
            ib = 2 * j, jb = 2 * j + 1, vertexIndex === offset ? (m_bounds[ib] = value, m_bounds[jb] = value) : (value > m_bounds[jb] && (m_bounds[jb] = value), 
            value < m_bounds[ib] && (m_bounds[ib] = value));
            m_computeBoundsTimestamp.modified();
        }
    }, this.findClosestVertex = function(point) {
        var vi, vPos, dx, dy, dz, dist, i, attr = vgl.vertexAttributeKeys.Position, sourceData = this.sourceData(attr), sizeOfDataType = sourceData.sizeOfAttributeDataType(attr), numberOfComponents = sourceData.attributeNumberOfComponents(attr), data = sourceData.data(), stride = sourceData.attributeStride(attr) / sizeOfDataType, offset = sourceData.attributeOffset(attr) / sizeOfDataType, minDist = Number.MAX_VALUE, minIndex = null;
        for (3 !== numberOfComponents && console.log("[warning] Find closest vertex assumes threecomponent vertex "), 
        point.z || (point = {
            x: point.x,
            y: point.y,
            z: 0
        }), vi = offset, i = 0; vi < data.length; vi += stride, i++) vPos = [ data[vi], data[vi + 1], data[vi + 2] ], 
        dx = vPos[0] - point.x, dy = vPos[1] - point.y, dz = vPos[2] - point.z, dist = Math.sqrt(dx * dx + dy * dy + dz * dz), 
        minDist > dist && (minDist = dist, minIndex = i);
        return minIndex;
    }, this.getPosition = function(index) {
        var attr = vgl.vertexAttributeKeys.Position, sourceData = this.sourceData(attr), sizeOfDataType = sourceData.sizeOfAttributeDataType(attr), numberOfComponents = sourceData.attributeNumberOfComponents(attr), data = sourceData.data(), stride = sourceData.attributeStride(attr) / sizeOfDataType, offset = sourceData.attributeOffset(attr) / sizeOfDataType;
        return 3 !== numberOfComponents && console.log("[warning] getPosition assumes three component data"), 
        [ data[offset + index * stride], data[offset + index * stride + 1], data[offset + index * stride + 2] ];
    }, this.getScalar = function(index) {
        var numberOfComponents, sizeOfDataType, data, stride, offset, attr = vgl.vertexAttributeKeys.Scalar, sourceData = this.sourceData(attr);
        return sourceData ? (numberOfComponents = sourceData.attributeNumberOfComponents(attr), 
        sizeOfDataType = sourceData.sizeOfAttributeDataType(attr), data = sourceData.data(), 
        stride = sourceData.attributeStride(attr) / sizeOfDataType, offset = sourceData.attributeOffset(attr) / sizeOfDataType, 
        index * stride + offset >= data.length && console.log("access out of bounds in getScalar"), 
        data[index * stride + offset]) : null;
    }, this;
}, inherit(vgl.geometryData, vgl.data), vgl.mapper = function() {
    "use strict";
    function deleteVertexBufferObjects() {
        var i;
        for (i = 0; i < m_buffers.length; ++i) gl.deleteBuffer(m_buffers[i]);
    }
    function createVertexBufferObjects() {
        if (m_geomData) {
            var i, j, k, keys, ks, numberOfPrimitives, numberOfSources = m_geomData.numberOfSources(), bufferId = null;
            for (i = 0; numberOfSources > i; ++i) {
                for (bufferId = gl.createBuffer(), gl.bindBuffer(gl.ARRAY_BUFFER, bufferId), gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m_geomData.source(i).data()), gl.STATIC_DRAW), 
                keys = m_geomData.source(i).keys(), ks = [], j = 0; j < keys.length; ++j) ks.push(keys[j]);
                m_bufferVertexAttributeMap[i] = ks, m_buffers[i] = bufferId;
            }
            for (numberOfPrimitives = m_geomData.numberOfPrimitives(), k = 0; numberOfPrimitives > k; ++k) bufferId = gl.createBuffer(), 
            gl.bindBuffer(gl.ARRAY_BUFFER, bufferId), gl.bufferData(gl.ARRAY_BUFFER, m_geomData.primitive(k).indices(), gl.STATIC_DRAW), 
            m_buffers[i++] = bufferId;
            m_glCompileTimestamp.modified();
        }
    }
    function cleanUpDrawObjects() {
        m_bufferVertexAttributeMap = {}, m_buffers = [];
    }
    function setupDrawObjects() {
        deleteVertexBufferObjects(), cleanUpDrawObjects(), createVertexBufferObjects(), 
        m_dirty = !1;
    }
    if (!(this instanceof vgl.mapper)) return new vgl.mapper();
    vgl.boundingObject.call(this);
    var m_dirty = !0, m_color = [ 0, 1, 1 ], m_geomData = null, m_buffers = [], m_bufferVertexAttributeMap = {}, m_glCompileTimestamp = vgl.timestamp();
    return this.computeBounds = function() {
        if (null === m_geomData || "undefined" == typeof m_geomData) return void this.resetBounds();
        var computeBoundsTimestamp = this.computeBoundsTimestamp(), boundsDirtyTimestamp = this.boundsDirtyTimestamp(), geomBounds = null;
        boundsDirtyTimestamp.getMTime() > computeBoundsTimestamp.getMTime() && (geomBounds = m_geomData.bounds(), 
        this.setBounds(geomBounds[0], geomBounds[1], geomBounds[2], geomBounds[3], geomBounds[4], geomBounds[5]), 
        computeBoundsTimestamp.modified());
    }, this.color = function() {
        return m_color;
    }, this.setColor = function(r, g, b) {
        m_color[0] = r, m_color[1] = g, m_color[2] = b, this.modified();
    }, this.geometryData = function() {
        return m_geomData;
    }, this.setGeometryData = function(geom) {
        m_geomData !== geom && (m_geomData = geom, this.modified(), this.boundsDirtyTimestamp().modified());
    }, this.render = function(renderState) {
        this.getMTime() > m_glCompileTimestamp.getMTime() && setupDrawObjects(renderState), 
        gl.vertexAttrib3fv(vgl.vertexAttributeKeys.Color, this.color());
        var i, bufferIndex = 0, j = 0, noOfPrimitives = null, primitive = null;
        for (i in m_bufferVertexAttributeMap) if (m_bufferVertexAttributeMap.hasOwnProperty(i)) {
            for (gl.bindBuffer(gl.ARRAY_BUFFER, m_buffers[bufferIndex]), j = 0; j < m_bufferVertexAttributeMap[i].length; ++j) renderState.m_material.bindVertexData(renderState, m_bufferVertexAttributeMap[i][j]);
            ++bufferIndex;
        }
        for (noOfPrimitives = m_geomData.numberOfPrimitives(), j = 0; noOfPrimitives > j; ++j) {
            switch (gl.bindBuffer(gl.ARRAY_BUFFER, m_buffers[bufferIndex++]), primitive = m_geomData.primitive(j), 
            primitive.primitiveType()) {
              case gl.POINTS:
                gl.drawArrays(gl.TRIANGLES, 0, primitive.numberOfIndices());
                break;

              case gl.LINES:
                gl.drawArrays(gl.LINES, 0, primitive.numberOfIndices());
                break;

              case gl.LINE_STRIP:
                gl.drawArrays(gl.LINE_STRIP, 0, primitive.numberOfIndices());
                break;

              case gl.TRIANGLES:
                gl.drawArrays(gl.TRIANGLES, 0, primitive.numberOfIndices());
                break;

              case gl.TRIANGLE_STRIP:
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, primitive.numberOfIndices());
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, null);
        }
    }, this;
}, inherit(vgl.mapper, vgl.boundingObject), vgl.groupMapper = function() {
    "use strict";
    if (!(this instanceof vgl.groupMapper)) return new vgl.groupMapper();
    vgl.mapper.call(this);
    var m_createMappersTimestamp = vgl.timestamp(), m_mappers = [], m_geomDataArray = [];
    return this.geometryData = function(index) {
        return void 0 !== index && index < m_geomDataArray.length ? m_geomDataArray[index] : m_geomDataArray.length > 0 ? m_geomDataArray[0] : null;
    }, this.setGeometryData = function(geom) {
        (1 !== m_geomDataArray.length || m_geomDataArray[0] !== geom) && (m_geomDataArray = [], 
        m_geomDataArray.push(geom), this.modified());
    }, this.geometryDataArray = function() {
        return m_geomDataArray;
    }, this.setGeometryDataArray = function(geoms) {
        if (geoms instanceof Array) {
            if (m_geomDataArray !== geoms) return m_geomDataArray = [], m_geomDataArray = geoms, 
            this.modified(), !0;
        } else console.log("[error] Requies array of geometry data");
        return !1;
    }, this.computeBounds = function() {
        if (null === m_geomDataArray || void 0 === m_geomDataArray) return void this.resetBounds();
        var computeBoundsTimestamp = this.computeBoundsTimestamp(), boundsDirtyTimestamp = this.boundsDirtyTimestamp(), m_bounds = this.bounds(), geomBounds = null, i = null;
        if (boundsDirtyTimestamp.getMTime() > computeBoundsTimestamp.getMTime()) {
            for (i = 0; i < m_geomDataArray.length; ++i) geomBounds = m_geomDataArray[i].bounds(), 
            m_bounds[0] > geomBounds[0] && (m_bounds[0] = geomBounds[0]), m_bounds[1] < geomBounds[1] && (m_bounds[1] = geomBounds[1]), 
            m_bounds[2] > geomBounds[2] && (m_bounds[2] = geomBounds[2]), m_bounds[3] < geomBounds[3] && (m_bounds[3] = geomBounds[3]), 
            m_bounds[4] > geomBounds[4] && (m_bounds[4] = geomBounds[4]), m_bounds[5] < geomBounds[5] && (m_bounds[5] = geomBounds[5]);
            this.modified(), computeBoundsTimestamp.modified();
        }
    }, this.render = function(renderState) {
        var i = null;
        if (this.getMTime() > m_createMappersTimestamp.getMTime()) {
            for (i = 0; i < m_geomDataArray.length; ++i) m_mappers.push(vgl.mapper()), m_mappers[i].setGeometryData(m_geomDataArray[i]);
            m_createMappersTimestamp.modified();
        }
        for (i = 0; i < m_mappers.length; ++i) m_mappers[i].render(renderState);
    }, this;
}, inherit(vgl.groupMapper, vgl.mapper), vgl.materialAttributeType = {
    Undefined: 0,
    ShaderProgram: 1,
    Texture: 2,
    Blend: 3,
    Depth: 4
}, vgl.materialAttribute = function(type) {
    "use strict";
    if (!(this instanceof vgl.materialAttribute)) return new vgl.materialAttribute();
    vgl.object.call(this);
    var m_type = type, m_enabled = !0;
    return this.type = function() {
        return m_type;
    }, this.enabled = function() {
        return m_enabled;
    }, this.setup = function() {
        return !1;
    }, this.bind = function() {
        return !1;
    }, this.undoBind = function() {
        return !1;
    }, this.setupVertexData = function() {
        return !1;
    }, this.bindVertexData = function() {
        return !1;
    }, this.undoBindVertexData = function() {
        return !1;
    }, this;
}, inherit(vgl.materialAttribute, vgl.object), vgl.blendFunction = function(source, destination) {
    "use strict";
    if (!(this instanceof vgl.blendFunction)) return new vgl.blendFunction(source, destination);
    var m_source = source, m_destination = destination;
    return this.apply = function() {
        gl.blendFuncSeparate(m_source, m_destination, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }, this;
}, vgl.blend = function() {
    "use strict";
    if (!(this instanceof vgl.blend)) return new vgl.blend();
    vgl.materialAttribute.call(this, vgl.materialAttributeType.Blend);
    var m_wasEnabled = !1, m_blendFunction = vgl.blendFunction(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    return this.bind = function(renderState) {
        return m_wasEnabled = gl.isEnabled(gl.BLEND), this.enabled() ? (gl.enable(gl.BLEND), 
        m_blendFunction.apply(renderState)) : gl.disable(gl.BLEND), !0;
    }, this.undoBind = function() {
        return m_wasEnabled ? gl.enable(gl.BLEND) : gl.disable(gl.BLEND), !0;
    }, this;
}, inherit(vgl.blend, vgl.materialAttribute), vgl.material = function() {
    "use strict";
    if (!(this instanceof vgl.material)) return new vgl.material();
    vgl.object.call(this);
    var m_shaderProgram = new vgl.shaderProgram(), m_binNumber = 100, m_textureAttributes = {}, m_attributes = {};
    return this.binNumber = function() {
        return m_binNumber;
    }, this.setBinNumber = function(binNo) {
        m_binNumber = binNo, this.modified();
    }, this.exists = function(attr) {
        return attr.type() === vgl.materialAttribute.Texture ? m_textureAttributes.hasOwnProperty(attr) : m_attributes.hasOwnProperty(attr);
    }, this.uniform = function(name) {
        return m_shaderProgram ? m_shaderProgram.uniform(name) : null;
    }, this.attribute = function(name) {
        return m_attributes.hasOwnProperty(name) ? m_attributes[name] : m_textureAttributes.hasOwnProperty(name) ? m_textureAttributes[name] : null;
    }, this.setAttribute = function(attr) {
        return attr.type() === vgl.materialAttributeType.Texture && m_textureAttributes[attr.textureUnit()] !== attr ? (m_textureAttributes[attr.textureUnit()] = attr, 
        this.modified(), !0) : m_attributes[attr.type()] === attr ? !1 : (attr.type() === vgl.materialAttributeType.ShaderProgram && (m_shaderProgram = attr), 
        m_attributes[attr.type()] = attr, this.modified(), !0);
    }, this.addAttribute = function(attr) {
        return this.exists(attr) ? !1 : attr.type() === vgl.materialAttributeType.Texture ? (m_textureAttributes[attr.textureUnit()] = attr, 
        this.modified(), !0) : (attr.type() === vgl.materialAttributeType.ShaderProgram && (m_shaderProgram = attr), 
        m_attributes[attr.type()] = attr, this.modified(), !0);
    }, this.shaderProgram = function() {
        return m_shaderProgram;
    }, this.render = function(renderState) {
        this.bind(renderState);
    }, this.remove = function(renderState) {
        this.undoBind(renderState);
    }, this.bind = function(renderState) {
        var key = null;
        for (key in m_attributes) m_attributes.hasOwnProperty(key) && m_attributes[key].bind(renderState);
        for (key in m_textureAttributes) m_textureAttributes.hasOwnProperty(key) && m_textureAttributes[key].bind(renderState);
    }, this.undoBind = function(renderState) {
        var key = null;
        for (key in m_attributes) m_attributes.hasOwnProperty(key) && m_attributes[key].undoBind(renderState);
        for (key in m_textureAttributes) m_textureAttributes.hasOwnProperty(key) && m_textureAttributes[key].undoBind(renderState);
    }, this.bindVertexData = function(renderState, key) {
        var i = null;
        for (i in m_attributes) m_attributes.hasOwnProperty(i) && m_attributes[i].bindVertexData(renderState, key);
    }, this.undoBindVertexData = function(renderState, key) {
        var i = null;
        for (i in m_attributes) m_attributes.hasOwnProperty(i) && m_attributes.undoBindVertexData(renderState, key);
    }, this;
}, vgl.material.RenderBin = {
    Base: 0,
    Default: 100,
    Opaque: 100,
    Transparent: 1e3,
    Overlay: 1e4
}, inherit(vgl.material, vgl.object), vgl.renderState = function() {
    "use strict";
    this.m_modelViewMatrix = mat4.create(), this.m_normalMatrix = mat4.create(), this.m_projectionMatrix = null, 
    this.m_material = null, this.m_mapper = null;
}, vgl.renderer = function() {
    "use strict";
    if (!(this instanceof vgl.renderer)) return new vgl.renderer();
    vgl.object.call(this);
    var m_sceneRoot = new vgl.groupNode(), m_camera = new vgl.camera(), m_nearClippingPlaneTolerance = null, m_x = 0, m_y = 0, m_width = 0, m_height = 0, m_resizable = !0, m_resetScene = !0, m_layer = 0, m_resetClippingRange = !0;
    return m_camera.addChild(m_sceneRoot), this.width = function() {
        return m_width;
    }, this.height = function() {
        return m_height;
    }, this.layer = function() {
        return m_layer;
    }, this.setLayer = function(layerNo) {
        m_layer = layerNo, this.modified();
    }, this.isResizable = function() {
        return m_resizable;
    }, this.setResizable = function(r) {
        m_resizable = r;
    }, this.backgroundColor = function() {
        return m_camera.clearColor();
    }, this.setBackgroundColor = function(r, g, b, a) {
        m_camera.setClearColor(r, g, b, a), this.modified();
    }, this.sceneRoot = function() {
        return m_sceneRoot;
    }, this.camera = function() {
        return m_camera;
    }, this.render = function() {
        var i, renSt, children, actor = null, sortedActors = [], mvMatrixInv = mat4.create(), clearColor = null;
        for (gl.enable(gl.DEPTH_TEST), gl.depthFunc(gl.LEQUAL), m_camera.clearMask() & vgl.GL.ColorBufferBit && (clearColor = m_camera.clearColor(), 
        gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3])), m_camera.clearMask() & vgl.GL.DepthBufferBit && gl.clearDepth(m_camera.clearDepth()), 
        gl.clear(m_camera.clearMask()), gl.viewport(m_x, m_y, m_width, m_height), renSt = new vgl.renderState(), 
        children = m_sceneRoot.children(), children.length > 0 && m_resetScene && (this.resetCamera(), 
        m_resetScene = !1), i = 0; i < children.length; ++i) actor = children[i], actor.computeBounds(), 
        actor.visible() && sortedActors.push([ actor.material().binNumber(), actor ]);
        for (sortedActors.sort(function(a, b) {
            return a[0] - b[0];
        }), i = 0; i < sortedActors.length; ++i) actor = sortedActors[i][1], actor.referenceFrame() === vgl.boundingObject.ReferenceFrame.Relative ? (mat4.multiply(renSt.m_modelViewMatrix, m_camera.viewMatrix(), actor.matrix()), 
        renSt.m_projectionMatrix = m_camera.projectionMatrix()) : (renSt.m_modelViewMatrix = actor.matrix(), 
        renSt.m_projectionMatrix = mat4.create(), mat4.ortho(renSt.m_projectionMatrix, 0, m_width, 0, m_height, -1, 1)), 
        mat4.invert(mvMatrixInv, renSt.m_modelViewMatrix), mat4.transpose(renSt.m_normalMatrix, mvMatrixInv), 
        renSt.m_material = actor.material(), renSt.m_mapper = actor.mapper(), renSt.m_material.render(renSt), 
        renSt.m_mapper.render(renSt), renSt.m_material.remove(renSt);
    }, this.resetCamera = function() {
        m_camera.computeBounds();
        var vn = m_camera.directionOfProjection(), visibleBounds = m_camera.bounds(), center = [ (visibleBounds[0] + visibleBounds[1]) / 2, (visibleBounds[2] + visibleBounds[3]) / 2, (visibleBounds[4] + visibleBounds[5]) / 2 ], diagonals = [ visibleBounds[1] - visibleBounds[0], visibleBounds[3] - visibleBounds[2], visibleBounds[5] - visibleBounds[4] ], radius = 0, aspect = m_camera.viewAspect(), angle = m_camera.viewAngle(), distance = null, vup = null;
        radius = diagonals[0] > diagonals[1] ? diagonals[0] > diagonals[2] ? diagonals[0] / 2 : diagonals[2] / 2 : diagonals[1] > diagonals[2] ? diagonals[1] / 2 : diagonals[2] / 2, 
        angle = aspect >= 1 ? 2 * Math.atan(Math.tan(.5 * angle) / aspect) : 2 * Math.atan(Math.tan(.5 * angle) * aspect), 
        distance = radius / Math.sin(.5 * angle), vup = m_camera.viewUpDirection(), Math.abs(vec3.dot(vup, vn)) > .999 && m_camera.setViewUpDirection(-vup[2], vup[0], vup[1]), 
        m_camera.setFocalPoint(center[0], center[1], center[2]), m_camera.setPosition(center[0] + distance * -vn[0], center[1] + distance * -vn[1], center[2] + distance * -vn[2]), 
        this.resetCameraClippingRange(visibleBounds);
    }, this.hasValidBounds = function(bounds) {
        return bounds[0] == Number.MAX_VALUE || bounds[1] == -Number.MAX_VALUE || bounds[2] == Number.MAX_VALUE || bounds[3] == -Number.MAX_VALUE || bounds[4] == Number.MAX_VALUE || bounds[5] == -Number.MAX_VALUE ? !1 : !0;
    }, this.resetCameraClippingRange = function(bounds) {
        if ("undefined" == typeof bounds && (m_camera.computeBounds(), bounds = m_camera.bounds()), 
        this.hasValidBounds(bounds)) {
            var vn = m_camera.viewPlaneNormal(), position = m_camera.position(), a = -vn[0], b = -vn[1], c = -vn[2], d = -(a * position[0] + b * position[1] + c * position[2]), range = vec2.create(), dist = null, i = null, j = null, k = null;
            if (m_resetClippingRange) {
                for (range[0] = a * bounds[0] + b * bounds[2] + c * bounds[4] + d, range[1] = 1e-18, 
                k = 0; 2 > k; k++) for (j = 0; 2 > j; j++) for (i = 0; 2 > i; i++) dist = a * bounds[i] + b * bounds[2 + j] + c * bounds[4 + k] + d, 
                range[0] = dist < range[0] ? dist : range[0], range[1] = dist > range[1] ? dist : range[1];
                range[0] < 0 && (range[0] = 0), range[0] = .99 * range[0] - .5 * (range[1] - range[0]), 
                range[1] = 1.01 * range[1] + .5 * (range[1] - range[0]), range[0] = range[0] >= range[1] ? .01 * range[1] : range[0], 
                m_nearClippingPlaneTolerance || (m_nearClippingPlaneTolerance = .01, null !== gl && gl.getParameter(gl.DEPTH_BITS) > 16 && (m_nearClippingPlaneTolerance = .001)), 
                range[0] < m_nearClippingPlaneTolerance * range[1] && (range[0] = m_nearClippingPlaneTolerance * range[1]), 
                m_camera.setClippingRange(range[0], range[1]);
            }
        }
    }, this.resize = function(width, height) {
        this.positionAndResize(m_x, m_y, width, height);
    }, this.positionAndResize = function(x, y, width, height) {
        (0 > x || 0 > y || 0 > width || 0 > height) && console.log("[error] Invalid position and resize values", x, y, width, height), 
        m_resizable && (m_width = width, m_height = height, m_camera.setViewAspect(m_width / m_height), 
        this.modified());
    }, this.addActor = function(actor) {
        return actor instanceof vgl.actor ? (m_sceneRoot.addChild(actor), this.modified(), 
        !0) : !1;
    }, this.hasActor = function(actor) {
        return m_sceneRoot.hasChild(actor);
    }, this.addActors = function(actors) {
        var i = null;
        if (actors instanceof Array) {
            for (i = 0; i < actors.length; ++i) m_sceneRoot.addChild(actors[i]);
            this.modified();
        }
    }, this.removeActor = function(actor) {
        return -1 !== m_sceneRoot.children().indexOf(actor) ? (m_sceneRoot.removeChild(actor), 
        this.modified(), !0) : !1;
    }, this.removeActors = function(actors) {
        if (!(actors instanceof Array)) return !1;
        var i;
        for (i = 0; i < actors.length; ++i) m_sceneRoot.removeChild(actors[i]);
        return this.modified(), !0;
    }, this.removeAllActors = function() {
        return m_sceneRoot.removeChildren();
    }, this.worldToDisplay = function(worldPt, viewMatrix, projectionMatrix, width, height) {
        var viewProjectionMatrix = mat4.create(), winX = null, winY = null, winZ = null, winW = null, clipPt = null;
        return mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix), clipPt = vec4.create(), 
        vec4.transformMat4(clipPt, worldPt, viewProjectionMatrix), 0 !== clipPt[3] && (clipPt[0] = clipPt[0] / clipPt[3], 
        clipPt[1] = clipPt[1] / clipPt[3], clipPt[2] = clipPt[2] / clipPt[3], clipPt[3] = 1), 
        winX = (clipPt[0] + 1) / 2 * width, winY = (1 - clipPt[1]) / 2 * height, winZ = clipPt[2], 
        winW = clipPt[3], vec4.fromValues(winX, winY, winZ, winW);
    }, this.displayToWorld = function(displayPt, viewMatrix, projectionMatrix, width, height) {
        var x = 2 * displayPt[0] / width - 1, y = -(2 * displayPt[1] / height) + 1, z = displayPt[2], viewProjectionInverse = mat4.create(), worldPt = null;
        return mat4.multiply(viewProjectionInverse, projectionMatrix, viewMatrix), mat4.invert(viewProjectionInverse, viewProjectionInverse), 
        worldPt = vec4.fromValues(x, y, z, 1), vec4.transformMat4(worldPt, worldPt, viewProjectionInverse), 
        0 !== worldPt[3] && (worldPt[0] = worldPt[0] / worldPt[3], worldPt[1] = worldPt[1] / worldPt[3], 
        worldPt[2] = worldPt[2] / worldPt[3], worldPt[3] = 1), worldPt;
    }, this.focusDisplayPoint = function() {
        var focalPoint = m_camera.focalPoint(), focusWorldPt = vec4.fromValues(focalPoint[0], focalPoint[1], focalPoint[2], 1);
        return this.worldToDisplay(focusWorldPt, m_camera.viewMatrix(), m_camera.projectionMatrix(), m_width, m_height);
    }, this.resetScene = function() {
        return m_resetScene;
    }, this.setResetScene = function(reset) {
        m_resetScene !== reset && (m_resetScene = reset, this.modified());
    }, this.resetClippingRange = function() {
        return m_resetClippingRange;
    }, this.setResetClippingRange = function(reset) {
        m_resetClippingRange !== reset && (m_resetClippingRange = reset, this.modified());
    }, this;
}, inherit(vgl.renderer, vgl.object);

var gl = null;

vgl.renderWindow = function(canvas) {
    "use strict";
    if (!(this instanceof vgl.renderWindow)) return new vgl.renderWindow(canvas);
    vgl.object.call(this);
    var m_x = 0, m_y = 0, m_width = 400, m_height = 400, m_canvas = canvas, m_activeRender = null, m_renderers = [];
    return this.windowSize = function() {
        return [ m_width, m_height ];
    }, this.setWindowSize = function(width, height) {
        return m_width !== width || m_height !== height ? (m_width = width, m_height = height, 
        this.modified(), !0) : !1;
    }, this.windowPosition = function() {
        return [ m_x, m_y ];
    }, this.setWindowPosition = function(x, y) {
        return m_x !== x || m_y !== y ? (m_x = x, m_y = y, this.modified(), !0) : !1;
    }, this.renderers = function() {
        return m_renderers;
    }, this.activeRenderer = function() {
        return m_activeRender;
    }, this.addRenderer = function(ren) {
        return this.hasRenderer(ren) === !1 ? (m_renderers.push(ren), null === m_activeRender && (m_activeRender = ren), 
        0 !== ren.layer() && ren.camera().setClearMask(vgl.GL.DepthBufferBit), this.modified(), 
        !0) : !1;
    }, this.removeRenderer = function(ren) {
        var index = m_renderers.indexOf(ren);
        return -1 !== index ? (m_activeRender === ren && (m_activeRender = null), m_renderers.splice(index, 1), 
        this.modified(), !0) : !1;
    }, this.getRenderer = function(index) {
        return index < m_renderers.length ? m_renderers[index] : (console.log("[WARNING] Out of index array"), 
        null);
    }, this.hasRenderer = function(ren) {
        var i;
        for (i = 0; i < m_renderers.length; ++i) if (ren === m_renderers[i]) return !0;
        return !1;
    }, this.resize = function(width, height) {
        this.positionAndResize(m_x, m_y, width, height), this.modified();
    }, this.positionAndResize = function(x, y, width, height) {
        m_x = x, m_y = y, m_width = width, m_height = height;
        var i;
        for (i = 0; i < m_renderers.length; ++i) m_renderers[i].positionAndResize(m_x, m_y, m_width, m_height);
        this.modified();
    }, this.createWindow = function() {
        gl = null;
        try {
            gl = m_canvas.getContext("webgl") || m_canvas.getContext("experimental-webgl");
            var i;
            for (i = 0; i < m_renderers.length; ++i) (m_renderers[i].width() > m_width || 0 === m_renderers[i].width() || m_renderers[i].height() > m_height || 0 === m_renderers[i].height()) && m_renderers[i].resize(m_x, m_y, m_width, m_height);
            return !0;
        } catch (e) {}
        return gl || console("[ERROR] Unable to initialize WebGL. Your browser may not support it."), 
        !1;
    }, this.deleteWindow = function() {}, this.render = function() {
        var i;
        for (m_renderers.sort(function(a, b) {
            return a.layer() - b.layer();
        }), i = 0; i < m_renderers.length; ++i) m_renderers[i].render();
    }, this.focusDisplayPoint = function() {
        return m_activeRender.focusDisplayPoint();
    }, this.displayToWorld = function(x, y, focusDisplayPoint, ren) {
        ren = void 0 === ren ? ren = m_activeRender : ren;
        var camera = ren.camera();
        return focusDisplayPoint || (focusDisplayPoint = ren.focusDisplayPoint()), ren.displayToWorld(vec4.fromValues(x, y, focusDisplayPoint[2], 1), camera.viewMatrix(), camera.projectionMatrix(), m_width, m_height);
    }, this.worldToDisplay = function(x, y, z, ren) {
        ren = void 0 === ren ? ren = m_activeRender : ren;
        var camera = ren.camera();
        return ren.worldToDisplay(vec4.fromValues(x, y, z, 1), camera.viewMatrix(), camera.projectionMatrix(), m_width, m_height);
    }, this;
}, inherit(vgl.renderWindow, vgl.object), vgl.camera = function() {
    "use strict";
    if (!(this instanceof vgl.camera)) return new vgl.camera();
    vgl.groupNode.call(this);
    var m_viewAngle = 30 * Math.PI / 180, m_position = vec4.fromValues(0, 0, 1, 1), m_focalPoint = vec4.fromValues(0, 0, 0, 1), m_centerOfRotation = vec3.fromValues(0, 0, 0), m_viewUp = vec4.fromValues(0, 1, 0, 0), m_rightDir = vec4.fromValues(1, 0, 0, 0), m_near = .01, m_far = 1e4, m_viewAspect = 1, m_directionOfProjection = vec4.fromValues(0, 0, -1, 0), m_viewPlaneNormal = vec4.fromValues(0, 0, 1, 0), m_viewMatrix = mat4.create(), m_projectionMatrix = mat4.create(), m_computeModelViewMatrixTime = vgl.timestamp(), m_computeProjectMatrixTime = vgl.timestamp(), m_left = -1, m_right = 1, m_top = 1, m_bottom = -1, m_enableTranslation = !0, m_enableRotation = !0, m_enableScale = !0, m_enableParallelProjection = !1, m_clearColor = [ 1, 1, 1, 1 ], m_clearDepth = 1, m_clearMask = vgl.GL.ColorBufferBit | vgl.GL.DepthBufferBit;
    return this.viewAngle = function() {
        return m_viewAngle;
    }, this.setViewAngleDegrees = function(a) {
        m_viewAngle = Math.PI * a / 180, this.modified();
    }, this.setViewAngle = function(a) {
        m_enableScale && (m_viewAngle = a, this.modified());
    }, this.position = function() {
        return m_position;
    }, this.setPosition = function(x, y, z) {
        m_enableTranslation && (m_position = vec4.fromValues(x, y, z, 1), this.modified());
    }, this.focalPoint = function() {
        return m_focalPoint;
    }, this.setFocalPoint = function(x, y, z) {
        m_enableRotation && m_enableTranslation && (m_focalPoint = vec4.fromValues(x, y, z, 1), 
        this.modified());
    }, this.viewUpDirection = function() {
        return m_viewUp;
    }, this.setViewUpDirection = function(x, y, z) {
        m_viewUp = vec4.fromValues(x, y, z, 0), this.modified();
    }, this.centerOfRotation = function() {
        return m_centerOfRotation;
    }, this.setCenterOfRotation = function(centerOfRotation) {
        m_centerOfRotation = centerOfRotation, this.modified();
    }, this.clippingRange = function() {
        return [ m_near, m_far ];
    }, this.setClippingRange = function(near, far) {
        m_near = near, m_far = far, this.modified();
    }, this.viewAspect = function() {
        return m_viewAspect;
    }, this.setViewAspect = function(aspect) {
        m_viewAspect = aspect, this.modified();
    }, this.enableScale = function() {
        return m_enableScale;
    }, this.setEnableScale = function(flag) {
        return flag !== m_enableScale ? (m_enableScale = flag, this.modified(), !0) : m_enableScale;
    }, this.enableRotation = function() {
        return m_enableRotation;
    }, this.setEnableRotation = function(flag) {
        return flag !== m_enableRotation ? (m_enableRotation = flag, this.modified(), !0) : m_enableRotation;
    }, this.enableTranslation = function() {
        return m_enableTranslation;
    }, this.setEnableTranslation = function(flag) {
        return flag !== m_enableTranslation ? (m_enableTranslation = flag, this.modified(), 
        !0) : m_enableTranslation;
    }, this.isEnabledParallelProjection = function() {
        return m_enableParallelProjection;
    }, this.enableParallelProjection = function(flag) {
        return flag !== m_enableParallelProjection ? (m_enableParallelProjection = flag, 
        this.modified(), !0) : m_enableParallelProjection;
    }, this.setEnnableParallelProjection = function() {
        return enableParallelProjection();
    }, this.setParallelProjection = function(left, right, top, bottom) {
        m_left = left, m_right = right, m_top = top, m_bottom = bottom, this.modified();
    }, this.directionOfProjection = function() {
        return this.computeDirectionOfProjection(), m_directionOfProjection;
    }, this.viewPlaneNormal = function() {
        return this.computeViewPlaneNormal(), m_viewPlaneNormal;
    }, this.viewMatrix = function() {
        return this.computeViewMatrix();
    }, this.projectionMatrix = function() {
        return this.computeProjectionMatrix();
    }, this.clearMask = function() {
        return m_clearMask;
    }, this.setClearMask = function(mask) {
        m_clearMask = mask, this.modified();
    }, this.clearColor = function() {
        return m_clearColor;
    }, this.setClearColor = function(r, g, b, a) {
        m_clearColor[0] = r, m_clearColor[1] = g, m_clearColor[2] = b, m_clearColor[3] = a, 
        this.modified();
    }, this.clearDepth = function() {
        return m_clearDepth;
    }, this.setClearDepth = function(depth) {
        m_clearDepth = depth, this.modified();
    }, this.computeDirectionOfProjection = function() {
        vec3.subtract(m_directionOfProjection, m_focalPoint, m_position), vec3.normalize(m_directionOfProjection, m_directionOfProjection), 
        this.modified();
    }, this.computeViewPlaneNormal = function() {
        m_viewPlaneNormal[0] = -m_directionOfProjection[0], m_viewPlaneNormal[1] = -m_directionOfProjection[1], 
        m_viewPlaneNormal[2] = -m_directionOfProjection[2];
    }, this.zoom = function(d, dir) {
        0 !== d && m_enableTranslation && (d *= vec3.distance(m_focalPoint, m_position), 
        dir ? (m_position[0] = m_position[0] + d * dir[0], m_position[1] = m_position[1] + d * dir[1], 
        m_position[2] = m_position[2] + d * dir[2]) : (dir = m_directionOfProjection, m_position[0] = m_focalPoint[0] - d * dir[0], 
        m_position[1] = m_focalPoint[1] - d * dir[1], m_position[2] = m_focalPoint[2] - d * dir[2]), 
        this.modified());
    }, this.pan = function(dx, dy, dz) {
        m_enableTranslation && (m_position[0] += dx, m_position[1] += dy, m_position[2] += dz, 
        m_focalPoint[0] += dx, m_focalPoint[1] += dy, m_focalPoint[2] += dz, this.modified());
    }, this.computeOrthogonalAxes = function() {
        this.computeDirectionOfProjection(), vec3.cross(m_rightDir, m_directionOfProjection, m_viewUp), 
        vec3.normalize(m_rightDir, m_rightDir), this.modified();
    }, this.rotate = function(dx, dy) {
        if (m_enableRotation) {
            dx = .5 * dx * (Math.PI / 180), dy = .5 * dy * (Math.PI / 180);
            var mat = mat4.create(), inverseCenterOfRotation = new vec3.create();
            mat4.identity(mat), inverseCenterOfRotation[0] = -m_centerOfRotation[0], inverseCenterOfRotation[1] = -m_centerOfRotation[1], 
            inverseCenterOfRotation[2] = -m_centerOfRotation[2], mat4.translate(mat, mat, m_centerOfRotation), 
            mat4.rotate(mat, mat, dx, m_viewUp), mat4.rotate(mat, mat, dy, m_rightDir), mat4.translate(mat, mat, inverseCenterOfRotation), 
            vec4.transformMat4(m_position, m_position, mat), vec4.transformMat4(m_focalPoint, m_focalPoint, mat), 
            vec4.transformMat4(m_viewUp, m_viewUp, mat), vec4.normalize(m_viewUp, m_viewUp), 
            this.computeOrthogonalAxes(), this.modified();
        }
    }, this.computeViewMatrix = function() {
        return m_computeModelViewMatrixTime.getMTime() < this.getMTime() && (mat4.lookAt(m_viewMatrix, m_position, m_focalPoint, m_viewUp), 
        m_computeModelViewMatrixTime.modified()), m_viewMatrix;
    }, this.computeProjectionMatrix = function() {
        return m_computeProjectMatrixTime.getMTime() < this.getMTime() && (m_enableParallelProjection ? (console.log("paralle projection"), 
        mat4.ortho(m_projectionMatrix, m_left, m_right, m_bottom, m_top, m_near, m_far)) : mat4.perspective(m_projectionMatrix, m_viewAngle, m_viewAspect, m_near, m_far), 
        m_computeProjectMatrixTime.modified()), m_projectionMatrix;
    }, this.computeDirectionOfProjection(), this;
}, inherit(vgl.camera, vgl.groupNode), vgl.interactorStyle = function() {
    "use strict";
    if (!(this instanceof vgl.interactorStyle)) return new vgl.interactorStyle();
    vgl.object.call(this);
    var m_that = this, m_viewer = null;
    return this.viewer = function() {
        return m_viewer;
    }, this.setViewer = function(viewer) {
        viewer !== m_viewer && (m_viewer = viewer, $(m_viewer).on(vgl.event.mousePress, m_that.handleMouseDown), 
        $(m_viewer).on(vgl.event.mouseRelease, m_that.handleMouseUp), $(m_viewer).on(vgl.event.mouseMove, m_that.handleMouseMove), 
        $(m_viewer).on(vgl.event.mouseOut, m_that.handleMouseOut), $(m_viewer).on(vgl.event.mouseWheel, m_that.handleMouseWheel), 
        $(m_viewer).on(vgl.event.keyPress, m_that.handleKeyPress), $(m_viewer).on(vgl.event.mouseContextMenu, m_that.handleContextMenu), 
        $(m_viewer).on(vgl.event.click, m_that.handleClick), $(m_viewer).on(vgl.event.dblClick, m_that.handleDoubleClick), 
        this.modified());
    }, this.handleMouseDown = function() {
        return !0;
    }, this.handleMouseUp = function() {
        return !0;
    }, this.handleMouseMove = function() {
        return !0;
    }, this.handleMouseOut = function() {
        return !0;
    }, this.handleMouseWheel = function() {
        return !0;
    }, this.handleClick = function() {
        return !0;
    }, this.handleDoubleClick = function() {
        return !0;
    }, this.handleKeyPress = function() {
        return !0;
    }, this.handleContextMenu = function() {
        return !0;
    }, this.reset = function() {
        return !0;
    }, this;
}, inherit(vgl.interactorStyle, vgl.object), vgl.trackballInteractorStyle = function() {
    "use strict";
    if (!(this instanceof vgl.trackballInteractorStyle)) return new vgl.trackballInteractorStyle();
    vgl.interactorStyle.call(this);
    var m_outsideCanvas, m_that = this, m_leftMouseBtnDown = !1, m_rightMouseBtnDown = !1, m_midMouseBtnDown = !1, m_currPos = {
        x: 0,
        y: 0
    }, m_lastPos = {
        x: 0,
        y: 0
    };
    return this.handleMouseMove = function(event) {
        var fp, fdp, fwp, dp1, dp2, wp1, wp2, coords, dx, dy, dz, coords, m_zTrans, width = (m_that.viewer().canvas(), 
        m_that.viewer().renderWindow().windowSize()[0]), height = m_that.viewer().renderWindow().windowSize()[1], ren = m_that.viewer().renderWindow().activeRenderer(), cam = ren.camera(), coords = m_that.viewer().relMouseCoords(event);
        return m_outsideCanvas = !1, m_currPos = {
            x: 0,
            y: 0
        }, coords.x < 0 || coords.x > width ? (m_currPos.x = 0, m_outsideCanvas = !0) : m_currPos.x = coords.x, 
        coords.y < 0 || coords.y > height ? (m_currPos.y = 0, m_outsideCanvas = !0) : m_currPos.y = coords.y, 
        m_outsideCanvas !== !0 ? (fp = cam.focalPoint(), fwp = vec4.fromValues(fp[0], fp[1], fp[2], 1), 
        fdp = ren.worldToDisplay(fwp, cam.viewMatrix(), cam.projectionMatrix(), width, height), 
        dp1 = vec4.fromValues(m_currPos.x, m_currPos.y, fdp[2], 1), dp2 = vec4.fromValues(m_lastPos.x, m_lastPos.y, fdp[2], 1), 
        wp1 = ren.displayToWorld(dp1, cam.viewMatrix(), cam.projectionMatrix(), width, height), 
        wp2 = ren.displayToWorld(dp2, cam.viewMatrix(), cam.projectionMatrix(), width, height), 
        dx = wp1[0] - wp2[0], dy = wp1[1] - wp2[1], dz = wp1[2] - wp2[2], m_midMouseBtnDown && (cam.pan(-dx, -dy, -dz), 
        m_that.viewer().render()), m_leftMouseBtnDown && (cam.rotate(m_lastPos.x - m_currPos.x, m_lastPos.y - m_currPos.y), 
        ren.resetCameraClippingRange(), m_that.viewer().render()), m_rightMouseBtnDown && (m_zTrans = 2 * (m_currPos.y - m_lastPos.y) / height, 
        cam.zoom(m_zTrans > 0 ? 1 - Math.abs(m_zTrans) : 1 + Math.abs(m_zTrans)), ren.resetCameraClippingRange(), 
        m_that.viewer().render()), m_lastPos.x = m_currPos.x, m_lastPos.y = m_currPos.y, 
        !1) : void 0;
    }, this.handleMouseDown = function(event) {
        var coords;
        return 0 === event.button && (m_leftMouseBtnDown = !0), 1 === event.button && (m_midMouseBtnDown = !0), 
        2 === event.button && (m_rightMouseBtnDown = !0), coords = m_that.view.relMouseCoords(event), 
        m_lastPos.x = coords.x < 0 ? 0 : coords.x, m_lastPos.y = coords.y < 0 ? 0 : coords.y, 
        !1;
    }, this.handleMouseUp = function(event) {
        return 0 === event.button && (m_leftMouseBtnDown = !1), 1 === event.button && (m_midMouseBtnDown = !1), 
        2 === event.button && (m_rightMouseBtnDown = !1), !1;
    }, this.handleMouseWheel = function(event) {
        var ren = m_that.viewer().renderWindow().activeRenderer(), cam = ren.camera();
        return cam.zoom(event.originalEvent.wheelDelta < 0 ? .9 : 1.1), ren.resetCameraClippingRange(), 
        m_that.viewer().render(), !0;
    }, this;
}, inherit(vgl.trackballInteractorStyle, vgl.interactorStyle), vgl.pvwInteractorStyle = function() {
    "use strict";
    function render() {
        m_renderer.resetCameraClippingRange(), m_that.viewer().render();
    }
    if (!(this instanceof vgl.pvwInteractorStyle)) return new vgl.pvwInteractorStyle();
    vgl.trackballInteractorStyle.call(this);
    var m_width, m_height, m_renderer, m_camera, m_outsideCanvas, m_coords, m_currentMousePos, m_focalPoint, m_focusWorldPt, m_focusDisplayPt, m_displayPt1, m_displayPt2, m_worldPt1, m_worldPt2, m_dx, m_dy, m_dz, m_zTrans, m_that = this, m_leftMouseButtonDown = !1, m_rightMouseButtonDown = !1, m_middleMouseButtonDown = !1, m_mouseLastPos = {
        x: 0,
        y: 0
    };
    return this.handleMouseMove = function(event) {
        var rens = [], i = null, secCameras = [], deltaxy = null;
        for (m_width = m_that.viewer().renderWindow().windowSize()[0], m_height = m_that.viewer().renderWindow().windowSize()[1], 
        m_renderer = m_that.viewer().renderWindow().activeRenderer(), m_camera = m_renderer.camera(), 
        m_outsideCanvas = !1, m_coords = m_that.viewer().relMouseCoords(event), m_currentMousePos = {
            x: 0,
            y: 0
        }, rens = m_that.viewer().renderWindow().renderers(), i = 0; i < rens.length; ++i) m_renderer !== rens[i] && secCameras.push(rens[i].camera());
        if (m_coords.x < 0 || m_coords.x > m_width ? (m_currentMousePos.x = 0, m_outsideCanvas = !0) : m_currentMousePos.x = m_coords.x, 
        m_coords.y < 0 || m_coords.y > m_height ? (m_currentMousePos.y = 0, m_outsideCanvas = !0) : m_currentMousePos.y = m_coords.y, 
        m_outsideCanvas !== !0) {
            if (m_focalPoint = m_camera.focalPoint(), m_focusWorldPt = vec4.fromValues(m_focalPoint[0], m_focalPoint[1], m_focalPoint[2], 1), 
            m_focusDisplayPt = m_renderer.worldToDisplay(m_focusWorldPt, m_camera.viewMatrix(), m_camera.projectionMatrix(), m_width, m_height), 
            m_displayPt1 = vec4.fromValues(m_currentMousePos.x, m_currentMousePos.y, m_focusDisplayPt[2], 1), 
            m_displayPt2 = vec4.fromValues(m_mouseLastPos.x, m_mouseLastPos.y, m_focusDisplayPt[2], 1), 
            m_worldPt1 = m_renderer.displayToWorld(m_displayPt1, m_camera.viewMatrix(), m_camera.projectionMatrix(), m_width, m_height), 
            m_worldPt2 = m_renderer.displayToWorld(m_displayPt2, m_camera.viewMatrix(), m_camera.projectionMatrix(), m_width, m_height), 
            m_dx = m_worldPt1[0] - m_worldPt2[0], m_dy = m_worldPt1[1] - m_worldPt2[1], m_dz = m_worldPt1[2] - m_worldPt2[2], 
            m_middleMouseButtonDown && (m_camera.pan(-m_dx, -m_dy, -m_dz), render()), m_leftMouseButtonDown) {
                for (deltaxy = [ m_mouseLastPos.x - m_currentMousePos.x, m_mouseLastPos.y - m_currentMousePos.y ], 
                m_camera.rotate(deltaxy[0], deltaxy[1]), i = 0; i < secCameras.length; ++i) secCameras[i].rotate(deltaxy[0], deltaxy[1]);
                for (i = 0; i < rens.length; ++i) rens[i].resetCameraClippingRange();
                render();
            }
            return m_rightMouseButtonDown && (m_zTrans = 2 * (m_currentMousePos.y - m_mouseLastPos.y) / m_height, 
            m_camera.zoom(m_zTrans > 0 ? 1 - Math.abs(m_zTrans) : 1 + Math.abs(m_zTrans)), render()), 
            m_mouseLastPos.x = m_currentMousePos.x, m_mouseLastPos.y = m_currentMousePos.y, 
            !1;
        }
    }, this.handleMouseDown = function(event) {
        return 0 === event.button && (m_leftMouseButtonDown = !0), 1 === event.button && (m_middleMouseButtonDown = !0), 
        2 === event.button && (m_rightMouseButtonDown = !0), m_coords = m_that.viewer().relMouseCoords(event), 
        m_mouseLastPos.x = m_coords.x < 0 ? 0 : m_coords.x, m_mouseLastPos.y = m_coords.y < 0 ? 0 : m_coords.y, 
        !1;
    }, this.handleMouseUp = function(event) {
        m_that.viewer().canvas();
        return 0 === event.button && (m_leftMouseButtonDown = !1), 1 === event.button && (m_middleMouseButtonDown = !1), 
        2 === event.button && (m_rightMouseButtonDown = !1), !1;
    }, this;
}, inherit(vgl.pvwInteractorStyle, vgl.trackballInteractorStyle), vgl.viewer = function(canvas) {
    "use strict";
    if (!(this instanceof vgl.viewer)) return new vgl.viewer(canvas);
    vgl.object.call(this);
    var m_that = this, m_canvas = canvas, m_ready = !0, m_interactorStyle = null, m_renderer = vgl.renderer(), m_renderWindow = vgl.renderWindow(m_canvas);
    return this.canvas = function() {
        return m_canvas;
    }, this.renderWindow = function() {
        return m_renderWindow;
    }, this.init = function() {
        null !== m_renderWindow ? m_renderWindow.createWindow() : console.log("[ERROR] No render window attached");
    }, this.interactorStyle = function() {
        return m_interactorStyle;
    }, this.setInteractorStyle = function(style) {
        style !== m_interactorStyle && (m_interactorStyle = style, m_interactorStyle.setViewer(this), 
        this.modified());
    }, this.handleMouseDown = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            2 === event.button && fixedEvent.preventDefault(), fixedEvent.state = "down", fixedEvent.type = vgl.event.mousePress, 
            $(m_that).trigger(fixedEvent);
        }
        return !0;
    }, this.handleMouseUp = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.state = "up", fixedEvent.type = vgl.event.mouseRelease, 
            $(m_that).trigger(fixedEvent);
        }
        return !0;
    }, this.handleMouseMove = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.type = vgl.event.mouseMove, $(m_that).trigger(fixedEvent);
        }
        return !0;
    }, this.handleMouseWheel = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.type = vgl.event.mouseWheel, $(m_that).trigger(fixedEvent);
        }
        return !0;
    }, this.handleMouseOut = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.type = vgl.event.mouseOut, $(m_that).trigger(fixedEvent);
        }
        return !0;
    }, this.handleKeyPress = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.type = vgl.event.keyPress, $(m_that).trigger(fixedEvent);
        }
        return !0;
    }, this.handleContextMenu = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.type = vgl.event.contextMenu, $(m_that).trigger(fixedEvent);
        }
        return !1;
    }, this.handleClick = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.type = vgl.event.click, $(m_that).trigger(fixedEvent);
        }
        return !1;
    }, this.handleDoubleClick = function(event) {
        if (m_ready === !0) {
            var fixedEvent = $.event.fix(event || window.event);
            fixedEvent.preventDefault(), fixedEvent.type = vgl.event.dblClick, $(m_that).trigger(fixedEvent);
        }
        return !1;
    }, this.relMouseCoords = function(event) {
        if (void 0 === event.pageX || void 0 === event.pageY) throw "Missing attributes pageX and pageY on the event";
        var totalOffsetX = 0, totalOffsetY = 0, canvasX = 0, canvasY = 0, currentElement = m_canvas;
        do totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft, totalOffsetY += currentElement.offsetTop - currentElement.scrollTop; while (currentElement = currentElement.offsetParent);
        return canvasX = event.pageX - totalOffsetX, canvasY = event.pageY - totalOffsetY, 
        {
            x: canvasX,
            y: canvasY
        };
    }, this.render = function() {
        m_renderWindow.render();
    }, this.bindEventHandlers = function() {
        $(m_canvas).on("mousedown", this.handleMouseDown), $(m_canvas).on("mouseup", this.handleMouseUp), 
        $(m_canvas).on("mousemove", this.handleMouseMove), $(m_canvas).on("mousewheel", this.handleMouseWheel), 
        $(m_canvas).on("contextmenu", this.handleContextMenu);
    }, this.unbindEventHandlers = function() {
        $(m_canvas).off("mousedown", this.handleMouseDown), $(m_canvas).off("mouseup", this.handleMouseUp), 
        $(m_canvas).off("mousemove", this.handleMouseMove), $(m_canvas).off("mousewheel", this.handleMouseWheel), 
        $(m_canvas).off("contextmenu", this.handleContextMenu);
    }, this._init = function() {
        this.bindEventHandlers(), m_renderWindow.addRenderer(m_renderer);
    }, this._init(), this;
}, inherit(vgl.viewer, vgl.object), vgl.shader = function(type) {
    "use strict";
    if (!(this instanceof vgl.shader)) return new vgl.shader(type);
    vgl.object.call(this);
    var m_shaderHandle = null, m_compileTimestamp = vgl.timestamp(), m_shaderType = type, m_shaderSource = "";
    this.shaderHandle = function() {
        return m_shaderHandle;
    }, this.shaderType = function() {
        return m_shaderType;
    }, this.shaderSource = function() {
        return m_shaderSource;
    }, this.setShaderSource = function(source) {
        m_shaderSource = source, this.modified();
    }, this.compile = function() {
        return this.getMTime() < m_compileTimestamp.getMTime() ? m_shaderHandle : (gl.deleteShader(m_shaderHandle), 
        m_shaderHandle = gl.createShader(m_shaderType), gl.shaderSource(m_shaderHandle, m_shaderSource), 
        gl.compileShader(m_shaderHandle), gl.getShaderParameter(m_shaderHandle, gl.COMPILE_STATUS) ? (m_compileTimestamp.modified(), 
        m_shaderHandle) : (console.log("[ERROR] An error occurred compiling the shaders: " + gl.getShaderInfoLog(m_shaderHandle)), 
        console.log(m_shaderSource), gl.deleteShader(m_shaderHandle), null));
    }, this.attachShader = function(programHandle) {
        gl.attachShader(programHandle, m_shaderHandle);
    };
}, inherit(vgl.shader, vgl.object), vgl.shaderProgram = function() {
    "use strict";
    if (!(this instanceof vgl.shaderProgram)) return new vgl.shaderProgram();
    vgl.materialAttribute.call(this, vgl.materialAttributeType.ShaderProgram);
    var m_programHandle = 0, m_compileTimestamp = vgl.timestamp(), m_shaders = [], m_uniforms = [], m_vertexAttributes = {}, m_uniformNameToLocation = {}, m_vertexAttributeNameToLocation = {};
    return this.queryUniformLocation = function(name) {
        return gl.getUniformLocation(m_programHandle, name);
    }, this.queryAttributeLocation = function(name) {
        return gl.getAttribLocation(m_programHandle, name);
    }, this.addShader = function(shader) {
        if (m_shaders.indexOf(shader) > -1) return !1;
        var i;
        for (i = 0; i < m_shaders.length; ++i) m_shaders[i].shaderType() === shader.shaderType() && m_shaders.splice(m_shaders.indexOf(shader), 1);
        return m_shaders.push(shader), this.modified(), !0;
    }, this.addUniform = function(uniform) {
        return m_uniforms.indexOf(uniform) > -1 ? !1 : (m_uniforms.push(uniform), void this.modified());
    }, this.addVertexAttribute = function(attr, key) {
        m_vertexAttributes[key] = attr, this.modified();
    }, this.uniformLocation = function(name) {
        return m_uniformNameToLocation[name];
    }, this.attributeLocation = function(name) {
        return m_vertexAttributeNameToLocation[name];
    }, this.uniform = function(name) {
        var i;
        for (i = 0; i < m_uniforms.length; ++i) if (m_uniforms[i].name() === name) return m_uniforms[i];
        return null;
    }, this.updateUniforms = function() {
        var i;
        for (i = 0; i < m_uniforms.length; ++i) m_uniforms[i].callGL(m_uniformNameToLocation[m_uniforms[i].name()]);
    }, this.link = function() {
        return gl.linkProgram(m_programHandle), gl.getProgramParameter(m_programHandle, gl.LINK_STATUS) ? !0 : (console.log("[ERROR] Unable to initialize the shader program."), 
        !1);
    }, this.use = function() {
        gl.useProgram(m_programHandle);
    }, this.cleanUp = function() {
        this.deleteVertexAndFragment(), this.deleteProgram();
    }, this.deleteProgram = function() {
        gl.deleteProgram(m_programHandle);
    }, this.deleteVertexAndFragment = function() {
        var i;
        for (i = 0; i < m_shaders.length; ++i) gl.deleteShader(m_shaders[i].shaderHandle());
    }, this.bind = function(renderState) {
        var i = 0;
        if (0 === m_programHandle || m_compileTimestamp.getMTime() < this.getMTime()) {
            if (m_programHandle = gl.createProgram(), 0 === m_programHandle) return console.log("[ERROR] Cannot create Program Object"), 
            !1;
            for (i = 0; i < m_shaders.length; ++i) m_shaders[i].compile(), m_shaders[i].attachShader(m_programHandle);
            this.bindAttributes(), this.link() || (console.log("[ERROR] Failed to link Program"), 
            this.cleanUp()), this.use(), this.bindUniforms(), m_compileTimestamp.modified();
        } else this.use();
        for (i = 0; i < m_uniforms.length; ++i) m_uniforms[i].update(renderState, this);
        this.updateUniforms();
    }, this.undoBind = function() {}, this.bindVertexData = function(renderState, key) {
        m_vertexAttributes.hasOwnProperty(key) && m_vertexAttributes[key].bindVertexData(renderState, key);
    }, this.undoBindVertexData = function(renderState, key) {
        m_vertexAttributes.hasOwnProperty(key) && m_vertexAttributes[key].undoBindVertexData(renderState, key);
    }, this.bindUniforms = function() {
        var i;
        for (i = 0; i < m_uniforms.length; ++i) m_uniformNameToLocation[m_uniforms[i].name()] = this.queryUniformLocation(m_uniforms[i].name());
    }, this.bindAttributes = function() {
        var key, name;
        for (key in m_vertexAttributes) name = m_vertexAttributes[key].name(), gl.bindAttribLocation(m_programHandle, key, name), 
        m_vertexAttributeNameToLocation[name] = key;
    }, this;
}, inherit(vgl.shaderProgram, vgl.materialAttribute), vgl.texture = function() {
    "use strict";
    function activateTextureUnit() {
        switch (m_that.m_textureUnit) {
          case 0:
            gl.activeTexture(gl.TEXTURE0);
            break;

          case 1:
            gl.activeTexture(gl.TEXTURE1);
            break;

          case 2:
            gl.activeTexture(gl.TEXTURE2);
            break;

          case 3:
            gl.activeTexture(gl.TEXTURE3);
            break;

          case 4:
            gl.activeTexture(gl.TEXTURE4);
            break;

          case 5:
            gl.activeTexture(gl.TEXTURE5);
            break;

          case 6:
            gl.activeTexture(gl.TEXTURE6);
            break;

          case 7:
            gl.activeTexture(gl.TEXTURE7);
            break;

          case 8:
            gl.activeTexture(gl.TEXTURE8);
            break;

          case 9:
            gl.activeTexture(gl.TEXTURE9);
            break;

          case 10:
            gl.activeTexture(gl.TEXTURE10);
            break;

          case 11:
            gl.activeTexture(gl.TEXTURE11);
            break;

          case 12:
            gl.activeTexture(gl.TEXTURE12);
            break;

          case 13:
            gl.activeTexture(gl.TEXTURE13);
            break;

          case 14:
            gl.activeTexture(gl.TEXTURE14);
            break;

          case 15:
            gl.activeTexture(gl.TEXTURE15);
            break;

          default:
            throw "[error] Texture unit " + this.m_textureUnit + " is not supported";
        }
    }
    if (!(this instanceof vgl.texture)) return new vgl.texture();
    vgl.materialAttribute.call(this, vgl.materialAttributeType.Texture), this.m_width = 0, 
    this.m_height = 0, this.m_depth = 0, this.m_textureHandle = null, this.m_textureUnit = 0, 
    this.m_pixelFormat = null, this.m_pixelDataType = null, this.m_internalFormat = null, 
    this.m_image = null;
    var m_setupTimestamp = vgl.timestamp(), m_that = this;
    return this.setup = function() {
        activateTextureUnit(), gl.deleteTexture(this.m_textureHandle), this.m_textureHandle = gl.createTexture(), 
        gl.bindTexture(gl.TEXTURE_2D, this.m_textureHandle), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1), 
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !0), null !== this.m_image ? (this.updateDimensions(), 
        this.computeInternalFormatUsingImage(), gl.texImage2D(gl.TEXTURE_2D, 0, this.m_internalFormat, this.m_pixelFormat, this.m_pixelDataType, this.m_image)) : gl.texImage2D(gl.TEXTURE_2D, 0, this.m_internalFormat, this.m_pixelFormat, this.m_pixelDataType, null), 
        gl.bindTexture(gl.TEXTURE_2D, null), m_setupTimestamp.modified();
    }, this.bind = function(renderState) {
        this.getMTime() > m_setupTimestamp.getMTime() && this.setup(renderState), activateTextureUnit(), 
        gl.bindTexture(gl.TEXTURE_2D, this.m_textureHandle);
    }, this.undoBind = function() {
        gl.bindTexture(gl.TEXTURE_2D, null);
    }, this.image = function() {
        return this.m_image;
    }, this.setImage = function(image) {
        return null !== image ? (this.m_image = image, this.updateDimensions(), this.modified(), 
        !0) : !1;
    }, this.textureUnit = function() {
        return this.m_textureUnit;
    }, this.setTextureUnit = function(unit) {
        return this.m_textureUnit === unit ? !1 : (this.m_textureUnit = unit, this.modified(), 
        !0);
    }, this.width = function() {
        return this.m_width;
    }, this.setWidth = function(width) {
        return null === this.m_image ? !1 : (this.m_width = width, this.modified(), !0);
    }, this.depth = function() {
        return this.m_depth;
    }, this.setDepth = function(depth) {
        return null === this.m_image ? !1 : (this.m_depth = depth, this.modified(), !0);
    }, this.textureHandle = function() {
        return this.m_textureHandle;
    }, this.internalFormat = function() {
        return this.m_internalFormat;
    }, this.setInternalFormat = function(internalFormat) {
        return this.m_internalFormat !== internalFormat ? (this.m_internalFormat = internalFormat, 
        this.modified(), !0) : !1;
    }, this.pixelFormat = function() {
        return this.m_pixelFormat;
    }, this.setPixelFormat = function(pixelFormat) {
        return null === this.m_image ? !1 : (this.m_pixelFormat = pixelFormat, this.modified(), 
        !0);
    }, this.pixelDataType = function() {
        return this.m_pixelDataType;
    }, this.setPixelDataType = function(pixelDataType) {
        return null === this.m_image ? !1 : (this.m_pixelDataType = pixelDataType, this.modified(), 
        !0);
    }, this.computeInternalFormatUsingImage = function() {
        this.m_internalFormat = gl.RGBA, this.m_pixelFormat = gl.RGBA, this.m_pixelDataType = gl.UNSIGNED_BYTE;
    }, this.updateDimensions = function() {
        null !== this.m_image && (this.m_width = this.m_image.width, this.m_height = this.m_image.height, 
        this.m_depth = 0);
    }, this;
}, inherit(vgl.texture, vgl.materialAttribute), vgl.lookupTable = function() {
    "use strict";
    if (!(this instanceof vgl.lookupTable)) return new vgl.lookupTable();
    vgl.texture.call(this);
    var m_setupTimestamp = vgl.timestamp(), m_range = [ 0, 0 ];
    return this.m_colorTable = [ .07514311, .468049805, 1, 1, .247872569, .498782363, 1, 1, .339526309, .528909511, 1, 1, .409505078, .558608486, 1, 1, .468487184, .588057293, 1, 1, .520796675, .617435078, 1, 1, .568724526, .646924167, 1, 1, .613686735, .676713218, 1, 1, .656658579, .707001303, 1, 1, .698372844, .738002964, 1, 1, .739424025, .769954435, 1, 1, .780330104, .803121429, 1, 1, .821573924, .837809045, 1, 1, .863634967, .874374691, 1, 1, .907017747, .913245283, 1, 1, .936129275, .938743558, .983038586, 1, .943467973, .943498599, .943398095, 1, .990146732, .928791426, .917447482, 1, 1, .88332677, .861943246, 1, 1, .833985467, .803839606, 1, 1, .788626485, .750707739, 1, 1, .746206642, .701389973, 1, 1, .70590052, .654994046, 1, 1, .667019783, .610806959, 1, 1, .6289553, .568237474, 1, 1, .591130233, .526775617, 1, 1, .552955184, .485962266, 1, 1, .513776083, .445364274, 1, 1, .472800903, .404551679, 1, 1, .428977855, .363073592, 1, 1, .380759558, .320428137, 1, .961891484, .313155629, .265499262, 1, .916482116, .236630659, .209939162, 1 ].map(function(x) {
        return 255 * x;
    }), this.setup = function() {
        0 === this.textureUnit() ? gl.activeTexture(gl.TEXTURE0) : 1 === this.textureUnit() && gl.activeTexture(gl.TEXTURE1), 
        gl.deleteTexture(this.m_textureHandle), this.m_textureHandle = gl.createTexture(), 
        gl.bindTexture(gl.TEXTURE_2D, this.m_textureHandle), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR), 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR), gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE), 
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE), gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1), 
        this.m_width = this.m_colorTable.length / 4, this.m_height = 1, this.m_depth = 0, 
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.m_width, this.m_height, this.m_depth, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.m_colorTable)), 
        gl.bindTexture(gl.TEXTURE_2D, null), m_setupTimestamp.modified();
    }, this.colorTable = function() {
        return this.m_colorTable;
    }, this.setColorTable = function(colors) {
        return this.m_colorTable === colors ? !1 : (this.m_colorTable = colors, this.modified(), 
        !0);
    }, this.range = function() {
        return m_range;
    }, this.setRange = function(range) {
        return m_range === range ? !1 : (m_range = range, this.modified(), !0);
    }, this.updateRange = function(range) {
        range instanceof Array || console.log("[error] Invalid data type for range. Requires array [min,max]"), 
        range[0] < m_range[0] && (m_range[0] = range[0], this.modified()), range[1] > m_range[1] && (m_range[1] = range[1], 
        this.modified());
    }, this;
}, inherit(vgl.lookupTable, vgl.texture), vgl.uniform = function(type, name) {
    "use strict";
    if (!(this instanceof vgl.uniform)) return new vgl.uniform();
    this.getTypeNumberOfComponents = function(type) {
        switch (type) {
          case gl.FLOAT:
          case gl.INT:
          case gl.BOOL:
            return 1;

          case gl.FLOAT_VEC2:
          case gl.INT_VEC2:
          case gl.BOOL_VEC2:
            return 2;

          case gl.FLOAT_VEC3:
          case gl.INT_VEC3:
          case gl.BOOLT_VEC3:
            return 3;

          case gl.FLOAT_VEC4:
          case gl.INT_VEC4:
          case gl.BOOL_VEC4:
            return 4;

          case gl.FLOAT_MAT3:
            return 9;

          case gl.FLOAT_MAT4:
            return 16;

          default:
            return 0;
        }
    };
    var m_type = type, m_name = name, m_dataArray = [];
    return m_dataArray.length = this.getTypeNumberOfComponents(m_type), this.name = function() {
        return m_name;
    }, this.type = function() {
        return m_type;
    }, this.get = function() {
        return m_dataArray;
    }, this.set = function(value) {
        var i = 0;
        if (16 === m_dataArray.length) for (i = 0; 16 > i; ++i) m_dataArray[i] = value[i]; else if (9 === m_dataArray.length) for (i = 0; 9 > i; ++i) m_dataArray[i] = value[i]; else if (4 === m_dataArray.length) for (i = 0; 4 > i; ++i) m_dataArray[i] = value[i]; else if (3 === m_dataArray.length) for (i = 0; 3 > i; ++i) m_dataArray[i] = value[i]; else if (2 === m_dataArray.length) for (i = 0; 2 > i; ++i) m_dataArray[i] = value[i]; else m_dataArray[0] = value;
    }, this.callGL = function(location) {
        if (!(this.m_numberElements < 1)) switch (m_type) {
          case gl.BOOL:
          case gl.INT:
            gl.uniform1iv(location, m_dataArray);
            break;

          case gl.FLOAT:
            gl.uniform1fv(location, m_dataArray);
            break;

          case gl.FLOAT_VEC2:
            gl.uniform2fv(location, m_dataArray);
            break;

          case gl.FLOAT_VEC3:
            gl.uniform3fv(location, m_dataArray);
            break;

          case gl.FLOAT_VEC4:
            gl.uniform4fv(location, m_dataArray);
            break;

          case gl.FLOAT_MAT3:
            gl.uniformMatrix3fv(location, gl.FALSE, m_dataArray);
            break;

          case gl.FLOAT_MAT4:
            gl.uniformMatrix4fv(location, gl.FALSE, m_dataArray);
        }
    }, this.update = function() {}, this;
}, vgl.modelViewUniform = function(name) {
    "use strict";
    return this instanceof vgl.modelViewUniform ? (0 === name.length && (name = "modelViewMatrix"), 
    vgl.uniform.call(this, gl.FLOAT_MAT4, name), this.set(mat4.create()), this.update = function(renderState) {
        this.set(renderState.m_modelViewMatrix);
    }, this) : new vgl.modelViewUniform(name);
}, inherit(vgl.modelViewUniform, vgl.uniform), vgl.projectionUniform = function(name) {
    "use strict";
    return this instanceof vgl.projectionUniform ? (0 === name.length && (name = "projectionMatrix"), 
    vgl.uniform.call(this, gl.FLOAT_MAT4, name), this.set(mat4.create()), this.update = function(renderState) {
        this.set(renderState.m_projectionMatrix);
    }, this) : new vgl.projectionUniform(name);
}, inherit(vgl.projectionUniform, vgl.uniform), vgl.floatUniform = function(name, value) {
    "use strict";
    return this instanceof vgl.floatUniform ? (0 === name.length && (name = "floatUniform"), 
    value = void 0 === value ? 1 : value, vgl.uniform.call(this, gl.FLOAT, name), void this.set(value)) : new vgl.floatUniform(name, value);
}, inherit(vgl.floatUniform, vgl.uniform), vgl.normalMatrixUniform = function(name) {
    "use strict";
    return this instanceof vgl.normalMatrixUniform ? (0 === name.length && (name = "normalMatrix"), 
    vgl.uniform.call(this, gl.FLOAT_MAT4, name), this.set(mat4.create()), this.update = function(renderState) {
        this.set(renderState.m_normalMatrix);
    }, this) : new vgl.normalMatrixUniform(name);
}, inherit(vgl.normalMatrixUniform, vgl.uniform), vgl.vertexAttributeKeys = {
    Position: 0,
    Normal: 1,
    TextureCoordinate: 2,
    Color: 3,
    CountAttributeIndex: 4
}, vgl.vertexAttributeKeysIndexed = {
    Zero: 0,
    One: 1,
    Two: 2,
    Three: 3,
    Four: 4,
    Five: 5,
    Six: 6,
    Seven: 7,
    Eight: 8,
    Nine: 9
}, vgl.vertexAttribute = function(name) {
    "use strict";
    if (!(this instanceof vgl.vertexAttribute)) return new vgl.vertexAttribute(name);
    var m_name = name;
    this.name = function() {
        return m_name;
    }, this.bindVertexData = function(renderState, key) {
        var geometryData = renderState.m_mapper.geometryData(), sourceData = geometryData.sourceData(key), program = renderState.m_material.shaderProgram();
        gl.vertexAttribPointer(program.attributeLocation(m_name), sourceData.attributeNumberOfComponents(key), sourceData.attributeDataType(key), sourceData.normalized(key), sourceData.attributeStride(key), sourceData.attributeOffset(key)), 
        gl.enableVertexAttribArray(program.attributeLocation(m_name));
    }, this.undoBindVertexData = function(renderState) {
        var program = renderState.m_material.shaderProgram();
        gl.disableVertexAttribArray(program.attributeLocation(m_name));
    };
}, vgl.source = function() {
    "use strict";
    return this instanceof vgl.source ? (vgl.object.call(this), this.create = function() {}, 
    this) : new vgl.source();
}, inherit(vgl.source, vgl.object), vgl.planeSource = function() {
    "use strict";
    if (!(this instanceof vgl.planeSource)) return new vgl.planeSource();
    vgl.source.call(this);
    var m_origin = [ 0, 0, 0 ], m_point1 = [ 1, 0, 0 ], m_point2 = [ 0, 1, 0 ], m_normal = [ 0, 0, 1 ], m_xresolution = 1, m_yresolution = 1, m_geom = null;
    this.setOrigin = function(x, y, z) {
        m_origin[0] = x, m_origin[1] = y, m_origin[2] = z;
    }, this.setPoint1 = function(x, y, z) {
        m_point1[0] = x, m_point1[1] = y, m_point1[2] = z;
    }, this.setPoint2 = function(x, y, z) {
        m_point2[0] = x, m_point2[1] = y, m_point2[2] = z;
    }, this.create = function() {
        m_geom = new vgl.geometryData();
        var i, j, k, ii, numPts, numPolys, sourceTexCoords, x = [], tc = [], v1 = [], v2 = [], pts = [], posIndex = 0, normIndex = 0, colorIndex = 0, texCoordIndex = 0, positions = [], normals = [], colors = [], texCoords = [], indices = [], tristrip = null, sourcePositions = null, sourceColors = null;
        for (x.length = 3, tc.length = 2, v1.length = 3, v2.length = 3, pts.length = 3, 
        i = 0; 3 > i; i++) v1[i] = m_point1[i] - m_origin[i], v2[i] = m_point2[i] - m_origin[i];
        for (numPts = (m_xresolution + 1) * (m_yresolution + 1), numPolys = m_xresolution * m_yresolution * 2, 
        positions.length = 3 * numPts, normals.length = 3 * numPts, texCoords.length = 2 * numPts, 
        indices.length = numPts, k = 0, i = 0; m_yresolution + 1 > i; i++) for (tc[1] = i / m_yresolution, 
        j = 0; m_xresolution + 1 > j; j++) {
            for (tc[0] = j / m_xresolution, ii = 0; 3 > ii; ii++) x[ii] = m_origin[ii] + tc[0] * v1[ii] + tc[1] * v2[ii];
            positions[posIndex++] = x[0], positions[posIndex++] = x[1], positions[posIndex++] = x[2], 
            colors[colorIndex++] = 1, colors[colorIndex++] = 1, colors[colorIndex++] = 1, normals[normIndex++] = m_normal[0], 
            normals[normIndex++] = m_normal[1], normals[normIndex++] = m_normal[2], texCoords[texCoordIndex++] = tc[0], 
            texCoords[texCoordIndex++] = tc[1];
        }
        for (i = 0; m_yresolution > i; i++) for (j = 0; m_xresolution > j; j++) pts[0] = j + i * (m_xresolution + 1), 
        pts[1] = pts[0] + 1, pts[2] = pts[0] + m_xresolution + 2, pts[3] = pts[0] + m_xresolution + 1;
        for (i = 0; numPts > i; ++i) indices[i] = i;
        return tristrip = new vgl.triangleStrip(), tristrip.setIndices(indices), sourcePositions = vgl.sourceDataP3fv(), 
        sourcePositions.pushBack(positions), sourceColors = vgl.sourceDataC3fv(), sourceColors.pushBack(colors), 
        sourceTexCoords = vgl.sourceDataT2fv(), sourceTexCoords.pushBack(texCoords), m_geom.addSource(sourcePositions), 
        m_geom.addSource(sourceColors), m_geom.addSource(sourceTexCoords), m_geom.addPrimitive(tristrip), 
        m_geom;
    };
}, inherit(vgl.planeSource, vgl.source), vgl.pointSource = function() {
    "use strict";
    if (!(this instanceof vgl.pointSource)) return new vgl.pointSource();
    vgl.source.call(this);
    var m_this = this, m_positions = [], m_colors = [], m_textureCoords = [], m_size = [], m_geom = null;
    this.getPositions = function() {
        return m_positions;
    }, this.setPositions = function(positions) {
        positions instanceof Array ? m_positions = positions : console.log("[ERROR] Invalid data type for positions. Array is required."), 
        m_this.modified();
    }, this.getColors = function() {
        return m_colors;
    }, this.setColors = function(colors) {
        colors instanceof Array ? m_colors = colors : console.log("[ERROR] Invalid data type for colors. Array is required."), 
        m_this.modified();
    }, this.getSize = function() {
        return m_size;
    }, this.setSize = function(size) {
        m_size = size, this.modified();
    }, this.setTextureCoordinates = function(texcoords) {
        texcoords instanceof Array ? m_textureCoords = texcoords : console.log("[ERROR] Invalid data type for texture coordinates. Array is required."), 
        m_this.modified();
    }, this.create = function() {
        if (m_geom = new vgl.geometryData(), m_positions.length % 3 !== 0) return void console.log("[ERROR] Invalid length of the points array");
        var pointsPrimitive, sourcePositions, sourceColors, sourceTexCoords, sourceSize, numPts = m_positions.length / 3, i = 0, indices = [];
        for (indices.length = numPts, i = 0; numPts > i; ++i) indices[i] = i;
        if (sourceSize = vgl.sourceDataDf(), numPts !== m_size.length) for (i = 0; numPts > i; ++i) sourceSize.pushBack(m_size); else sourceSize.setData(m_size);
        return m_geom.addSource(sourceSize), pointsPrimitive = new vgl.points(), pointsPrimitive.setIndices(indices), 
        sourcePositions = vgl.sourceDataP3fv(), sourcePositions.pushBack(m_positions), m_geom.addSource(sourcePositions), 
        m_colors.length > 0 && m_colors.length === m_positions.length ? (sourceColors = vgl.sourceDataC3fv(), 
        sourceColors.pushBack(m_colors), m_geom.addSource(sourceColors)) : m_colors.length > 0 && m_colors.length !== m_positions.length && console.log("[ERROR] Number of colors are different than number of points"), 
        m_textureCoords.length > 0 && m_textureCoords.length === m_positions.length ? (sourceTexCoords = vgl.sourceDataT2fv(), 
        sourceTexCoords.pushBack(m_textureCoords), m_geom.addSource(sourceTexCoords)) : m_textureCoords.length > 0 && m_textureCoords.length / 2 !== m_positions.length / 3 && console.log("[ERROR] Number of texture coordinates are different than number of points"), 
        m_geom.addPrimitive(pointsPrimitive), m_geom;
    };
}, inherit(vgl.pointSource, vgl.source), vgl.lineSource = function(positions, colors) {
    "use strict";
    if (!(this instanceof vgl.lineSource)) return new vgl.lineSource();
    vgl.source.call(this);
    var m_positions = positions, m_colors = colors;
    this.setPositions = function(positions) {
        return positions instanceof Array ? (m_positions = positions, this.modified(), !0) : (console.log("[ERROR] Invalid data type for positions. Array is required."), 
        !1);
    }, this.setColors = function(colors) {
        return colors instanceof Array ? (m_colors = colors, this.modified(), !0) : (console.log("[ERROR] Invalid data type for colors. Array is required."), 
        !1);
    }, this.create = function() {
        if (!m_positions) return void console.log("[error] Invalid positions");
        if (m_positions.length % 3 !== 0) return void console.log("[error] Line source requires 3d points");
        if (m_positions.length % 3 !== 0) return void console.log("[ERROR] Invalid length of the points array");
        var i, linesPrimitive, sourcePositions, sourceColors, m_geom = new vgl.geometryData(), numPts = m_positions.length / 3, indices = [];
        for (indices.length = numPts, i = 0; numPts > i; ++i) indices[i] = i;
        return linesPrimitive = new vgl.lines(), linesPrimitive.setIndices(indices), sourcePositions = vgl.sourceDataP3fv(), 
        sourcePositions.pushBack(m_positions), m_geom.addSource(sourcePositions), m_colors && m_colors.length > 0 && m_colors.length === m_positions.length ? (sourceColors = vgl.sourceDataC3fv(), 
        sourceColors.pushBack(m_colors), m_geom.addSource(sourceColors)) : m_colors && m_colors.length > 0 && m_colors.length !== m_positions.length && console.log("[error] Number of colors are different than number of points"), 
        m_geom.addPrimitive(linesPrimitive), m_geom;
    };
}, inherit(vgl.lineSource, vgl.source), vgl.utils = function() {
    "use strict";
    return this instanceof vgl.utils ? (vgl.object.call(this), this) : new vgl.utils();
}, inherit(vgl.utils, vgl.object), vgl.utils.computePowerOfTwo = function(value, pow) {
    "use strict";
    for (pow = pow || 1; value > pow; ) pow *= 2;
    return pow;
}, vgl.utils.createTextureVertexShader = function() {
    "use strict";
    var vertexShaderSource = [ "attribute vec3 vertexPosition;", "attribute vec3 textureCoord;", "uniform mediump float pointSize;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "varying highp vec3 iTextureCoord;", "void main(void)", "{", "gl_PointSize = pointSize;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);", " iTextureCoord = textureCoord;", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
    return shader.setShaderSource(vertexShaderSource), shader;
}, vgl.utils.createTextureFragmentShader = function() {
    "use strict";
    var fragmentShaderSource = [ "varying highp vec3 iTextureCoord;", "uniform sampler2D sampler2d;", "uniform mediump float opacity;", "void main(void) {", "gl_FragColor = vec4(texture2D(sampler2d, vec2(iTextureCoord.s, iTextureCoord.t)).xyz, opacity);", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
    return shader.setShaderSource(fragmentShaderSource), shader;
}, vgl.utils.createRgbaTextureFragmentShader = function() {
    "use strict";
    var fragmentShaderSource = [ "varying highp vec3 iTextureCoord;", "uniform sampler2D sampler2d;", "void main(void) {", "gl_FragColor = vec4(texture2D(sampler2d, vec2(iTextureCoord.s, iTextureCoord.t)).xyzw);", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
    return shader.setShaderSource(fragmentShaderSource), shader;
}, vgl.utils.createVertexShader = function() {
    "use strict";
    var vertexShaderSource = [ "attribute vec3 vertexPosition;", "attribute vec3 vertexColor;", "uniform mediump float pointSize;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "varying mediump vec3 iVertexColor;", "varying highp vec3 iTextureCoord;", "void main(void)", "{", "gl_PointSize = pointSize;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);", " iVertexColor = vertexColor;", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
    return shader.setShaderSource(vertexShaderSource), shader;
}, vgl.utils.createPointVertexShader = function() {
    "use strict";
    var vertexShaderSource = [ "attribute vec3 vertexPosition;", "attribute vec3 vertexColor;", "attribute float vertexSize;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "varying mediump vec3 iVertexColor;", "varying highp vec3 iTextureCoord;", "void main(void)", "{", "gl_PointSize =  vertexSize;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);", " iVertexColor = vertexColor;", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
    return shader.setShaderSource(vertexShaderSource), shader;
}, vgl.utils.createVertexShaderSolidColor = function() {
    "use strict";
    var vertexShaderSource = [ "attribute vec3 vertexPosition;", "uniform mediump float pointSize;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "void main(void)", "{", "gl_PointSize = pointSize;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
    return shader.setShaderSource(vertexShaderSource), shader;
}, vgl.utils.createVertexShaderColorMap = function() {
    "use strict";
    var vertexShaderSource = [ "attribute vec3 vertexPosition;", "attribute float vertexScalar;", "uniform mediump float pointSize;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform float lutMin;", "uniform float lutMax;", "varying mediump float iVertexScalar;", "void main(void)", "{", "gl_PointSize = pointSize;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition, 1.0);", "iVertexScalar = (vertexScalar-lutMin)/(lutMax-lutMin);", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
    return shader.setShaderSource(vertexShaderSource), shader;
}, vgl.utils.createFragmentShader = function() {
    "use strict";
    var fragmentShaderSource = [ "varying mediump vec3 iVertexColor;", "uniform mediump float opacity;", "void main(void) {", "gl_FragColor = vec4(iVertexColor, opacity);", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
    return shader.setShaderSource(fragmentShaderSource), shader;
}, vgl.utils.createPhongVertexShader = function() {
    "use strict";
    var vertexShaderSource = [ "attribute highp vec3 vertexPosition;", "attribute mediump vec3 vertexNormal;", "attribute mediump vec3 vertexColor;", "uniform highp mat4 projectionMatrix;", "uniform mat4 modelViewMatrix;", "uniform mat4 normalMatrix;", "varying highp vec4 varPosition;", "varying mediump vec3 varNormal;", "varying mediump vec3 iVertexColor;", "void main(void)", "{", "varPosition = modelViewMatrix * vec4(vertexPosition, 1.0);", "gl_Position = projectionMatrix * varPosition;", "varNormal = vec3(normalMatrix * vec4(vertexNormal, 0.0));", "iVertexColor = vertexColor;", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
    return shader.setShaderSource(vertexShaderSource), shader;
}, vgl.utils.createPhongFragmentShader = function() {
    "use strict";
    var fragmentShaderSource = [ "precision mediump float;", "varying vec3 varNormal;", "varying vec4 varPosition;", "varying mediump vec3 iVertexColor;", "const vec3 lightPos = vec3(0.0, 0.0,10000.0);", "const vec3 ambientColor = vec3(0.01, 0.01, 0.01);", "const vec3 specColor = vec3(1.0, 1.0, 1.0);", "void main() {", "vec3 normal = normalize(varNormal);", "vec3 lightDir = normalize(lightPos);", "vec3 reflectDir = -reflect(lightDir, normal);", "vec3 viewDir = normalize(-varPosition.xyz);", "float lambertian = max(dot(lightDir,normal), 0.0);", "float specular = 0.0;", "if(lambertian > 0.0) {", "float specAngle = max(dot(reflectDir, viewDir), 0.0);", "specular = pow(specAngle, 64.0);", "}", "gl_FragColor = vec4(ambientColor +", "lambertian*iVertexColor +", "specular*specColor, 1.0);", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
    return shader.setShaderSource(fragmentShaderSource), shader;
}, vgl.utils.createFragmentShaderSolidColor = function(context, color) {
    "use strict";
    var fragmentShaderSource = [ "uniform mediump float opacity;", "void main(void) {", "gl_FragColor = vec4(" + color[0] + "," + color[1] + "," + color[2] + ", opacity);", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
    return shader.setShaderSource(fragmentShaderSource), shader;
}, vgl.utils.createFragmentShaderColorMap = function() {
    "use strict";
    var fragmentShaderSource = [ "varying mediump float iVertexScalar;", "uniform sampler2D sampler2d;", "uniform mediump float opacity;", "void main(void) {", "gl_FragColor = vec4(texture2D(sampler2d, vec2(iVertexScalar, 0.0)).xyz, opacity);", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
    return shader.setShaderSource(fragmentShaderSource), shader;
}, vgl.utils.createPointSpritesVertexShader = function() {
    "use strict";
    var vertexShaderSource = [ "attribute vec3 vertexPosition;", "attribute vec3 vertexColor;", "uniform mediump vec2 pointSize;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform float height;", "varying mediump vec3 iVertexColor;", "varying highp float iVertexScalar;", "void main(void)", "{", "mediump float realPointSize = pointSize.y;", "if (pointSize.x > pointSize.y) {", "  realPointSize = pointSize.x;}", "gl_PointSize = realPointSize ;", "iVertexScalar = vertexPosition.z;", "gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPosition.xy, height, 1.0);", " iVertexColor = vertexColor;", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
    return shader.setShaderSource(vertexShaderSource), shader;
}, vgl.utils.createPointSpritesFragmentShader = function() {
    "use strict";
    var fragmentShaderSource = [ "varying mediump vec3 iVertexColor;", "varying highp float iVertexScalar;", "uniform sampler2D opacityLookup;", "uniform highp float lutMin;", "uniform highp float lutMax;", "uniform sampler2D scalarsToColors;", "uniform int useScalarsToColors;", "uniform int useVertexColors;", "uniform mediump vec2 pointSize;", "uniform mediump float vertexColorWeight;", "void main(void) {", "mediump vec2 realTexCoord;", "if (pointSize.x > pointSize.y) {", "  realTexCoord = vec2(1.0, pointSize.y/pointSize.x) * gl_PointCoord;", "} else {", "  realTexCoord = vec2(pointSize.x/pointSize.y, 1.0) * gl_PointCoord;", "}", "highp float texOpacity = texture2D(opacityLookup, realTexCoord).w;", "if (useScalarsToColors == 1) {", "  gl_FragColor = vec4(texture2D(scalarsToColors, vec2((iVertexScalar - lutMin)/(lutMax - lutMin), 0.0)).xyz, texOpacity);", "} else if (useVertexColors == 1) {", "  gl_FragColor = vec4(iVertexColor, texOpacity);", "} else {", "  gl_FragColor = vec4(texture2D(opacityLookup, realTexCoord).xyz, texOpacity);", "}}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
    return shader.setShaderSource(fragmentShaderSource), shader;
}, vgl.utils.createTextureMaterial = function(isRgba) {
    "use strict";
    var mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), vertexShader = vgl.utils.createTextureVertexShader(gl), fragmentShader = null, posVertAttr = new vgl.vertexAttribute("vertexPosition"), texCoordVertAttr = new vgl.vertexAttribute("textureCoord"), pointsizeUniform = new vgl.floatUniform("pointSize", 5), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix"), samplerUniform = new vgl.uniform(gl.INT, "sampler2d"), opacityUniform = null;
    return samplerUniform.set(0), prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), 
    prog.addVertexAttribute(texCoordVertAttr, vgl.vertexAttributeKeys.TextureCoordinate), 
    prog.addUniform(pointsizeUniform), prog.addUniform(modelViewUniform), prog.addUniform(projectionUniform), 
    isRgba ? fragmentShader = vgl.utils.createRgbaTextureFragmentShader(gl) : (fragmentShader = vgl.utils.createTextureFragmentShader(gl), 
    opacityUniform = new vgl.floatUniform("opacity", 1), prog.addUniform(opacityUniform)), 
    prog.addShader(fragmentShader), prog.addShader(vertexShader), mat.addAttribute(prog), 
    mat.addAttribute(blend), mat;
}, vgl.utils.createGeometryMaterial = function() {
    "use strict";
    var mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), pointSize = 5, opacity = .5, vertexShader = vgl.utils.createVertexShader(gl), fragmentShader = vgl.utils.createFragmentShader(gl), posVertAttr = new vgl.vertexAttribute("vertexPosition"), colorVertAttr = new vgl.vertexAttribute("vertexColor"), pointsizeUniform = new vgl.floatUniform("pointSize", pointSize), opacityUniform = new vgl.floatUniform("opacity", opacity), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix");
    return prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), prog.addVertexAttribute(colorVertAttr, vgl.vertexAttributeKeys.Color), 
    prog.addUniform(pointsizeUniform), prog.addUniform(opacityUniform), prog.addUniform(modelViewUniform), 
    prog.addUniform(projectionUniform), prog.addShader(fragmentShader), prog.addShader(vertexShader), 
    mat.addAttribute(prog), mat.addAttribute(blend), mat;
}, vgl.utils.createPointGeometryMaterial = function(opacity) {
    "use strict";
    var mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), opacity = void 0 === opacity ? 1 : opacity, vertexShader = vgl.utils.createPointVertexShader(gl), fragmentShader = vgl.utils.createFragmentShader(gl), posVertAttr = new vgl.vertexAttribute("vertexPosition"), colorVertAttr = new vgl.vertexAttribute("vertexColor"), sizeVertAttr = new vgl.vertexAttribute("vertexSize"), opacityUniform = new vgl.floatUniform("opacity", opacity), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix");
    return prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), prog.addVertexAttribute(colorVertAttr, vgl.vertexAttributeKeys.Color), 
    prog.addVertexAttribute(sizeVertAttr, vgl.vertexAttributeKeys.Scalar), prog.addUniform(opacityUniform), 
    prog.addUniform(modelViewUniform), prog.addUniform(projectionUniform), prog.addShader(fragmentShader), 
    prog.addShader(vertexShader), mat.addAttribute(prog), mat.addAttribute(blend), mat;
}, vgl.utils.createPhongMaterial = function() {
    "use strict";
    var mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), vertexShader = vgl.utils.createPhongVertexShader(gl), fragmentShader = vgl.utils.createPhongFragmentShader(gl), posVertAttr = new vgl.vertexAttribute("vertexPosition"), normalVertAttr = new vgl.vertexAttribute("vertexNormal"), colorVertAttr = new vgl.vertexAttribute("vertexColor"), opacityUniform = new vgl.floatUniform("opacity", 1), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), normalUniform = new vgl.normalMatrixUniform("normalMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix");
    return prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), prog.addVertexAttribute(normalVertAttr, vgl.vertexAttributeKeys.Normal), 
    prog.addVertexAttribute(colorVertAttr, vgl.vertexAttributeKeys.Color), prog.addUniform(opacityUniform), 
    prog.addUniform(modelViewUniform), prog.addUniform(projectionUniform), prog.addUniform(normalUniform), 
    prog.addShader(fragmentShader), prog.addShader(vertexShader), mat.addAttribute(prog), 
    mat.addAttribute(blend), mat;
}, vgl.utils.createColorMaterial = function() {
    "use strict";
    var mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), vertexShader = vgl.utils.createVertexShader(gl), fragmentShader = vgl.utils.createFragmentShader(gl), posVertAttr = new vgl.vertexAttribute("vertexPosition"), texCoordVertAttr = new vgl.vertexAttribute("textureCoord"), colorVertAttr = new vgl.vertexAttribute("vertexColor"), pointsizeUniform = new vgl.floatUniform("pointSize", 5), opacityUniform = new vgl.floatUniform("opacity", .5), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix");
    return prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), prog.addVertexAttribute(colorVertAttr, vgl.vertexAttributeKeys.Color), 
    prog.addVertexAttribute(texCoordVertAttr, vgl.vertexAttributeKeys.TextureCoordinate), 
    prog.addUniform(pointsizeUniform), prog.addUniform(opacityUniform), prog.addUniform(modelViewUniform), 
    prog.addUniform(projectionUniform), prog.addShader(fragmentShader), prog.addShader(vertexShader), 
    mat.addAttribute(prog), mat.addAttribute(blend), mat;
}, vgl.utils.createColorMappedMaterial = function(lut) {
    "use strict";
    lut || (lut = new vgl.lookupTable());
    var scalarRange = lut.range(), mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), vertexShader = vgl.utils.createVertexShaderColorMap(gl, scalarRange[0], scalarRange[1]), fragmentShader = vgl.utils.createFragmentShaderColorMap(gl), posVertAttr = new vgl.vertexAttribute("vertexPosition"), scalarVertAttr = new vgl.vertexAttribute("vertexScalar"), pointsizeUniform = new vgl.floatUniform("pointSize", 5), opacityUniform = new vgl.floatUniform("opacity", .5), lutMinUniform = new vgl.floatUniform("lutMin", scalarRange[0]), lutMaxUniform = new vgl.floatUniform("lutMax", scalarRange[1]), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix"), samplerUniform = new vgl.uniform(gl.FLOAT, "sampler2d"), lookupTable = lut;
    return samplerUniform.set(0), prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), 
    prog.addVertexAttribute(scalarVertAttr, vgl.vertexAttributeKeys.Scalar), prog.addUniform(pointsizeUniform), 
    prog.addUniform(opacityUniform), prog.addUniform(lutMinUniform), prog.addUniform(lutMaxUniform), 
    prog.addUniform(modelViewUniform), prog.addUniform(projectionUniform), prog.addShader(fragmentShader), 
    prog.addShader(vertexShader), mat.addAttribute(prog), mat.addAttribute(blend), mat.addAttribute(lookupTable), 
    mat;
}, vgl.utils.updateColorMappedMaterial = function(mat, lut) {
    "use strict";
    if (!mat) return void console.log("[warning] Invalid material. Nothing to update.");
    if (!lut) return void console.log("[warning] Invalid lookup table. Nothing to update.");
    var lutMin = mat.shaderProgram().uniform("lutMin"), lutMax = mat.shaderProgram().uniform("lutMax");
    lutMin.set(lut.range()[0]), lutMax.set(lut.range()[1]), mat.setAttribute(lut);
}, vgl.utils.createSolidColorMaterial = function(color) {
    "use strict";
    color || (color = [ 1, 1, 1 ]);
    var mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), vertexShader = vgl.utils.createVertexShaderSolidColor(gl), fragmentShader = vgl.utils.createFragmentShaderSolidColor(gl, color), posVertAttr = new vgl.vertexAttribute("vertexPosition"), pointsizeUniform = new vgl.floatUniform("pointSize", 5), opacityUniform = new vgl.floatUniform("opacity", 1), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix");
    return prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), prog.addUniform(pointsizeUniform), 
    prog.addUniform(opacityUniform), prog.addUniform(modelViewUniform), prog.addUniform(projectionUniform), 
    prog.addShader(fragmentShader), prog.addShader(vertexShader), mat.addAttribute(prog), 
    mat.addAttribute(blend), mat;
}, vgl.utils.createPointSpritesMaterial = function(image, lut) {
    "use strict";
    var scalarRange = void 0 === lut ? [ 0, 1 ] : lut.range(), mat = new vgl.material(), blend = new vgl.blend(), prog = new vgl.shaderProgram(), vertexShader = vgl.utils.createPointSpritesVertexShader(gl), fragmentShader = vgl.utils.createPointSpritesFragmentShader(gl), posVertAttr = new vgl.vertexAttribute("vertexPosition"), colorVertAttr = new vgl.vertexAttribute("vertexColor"), heightUniform = new vgl.floatUniform("height", 0), vertexColorWeightUniform = new vgl.floatUniform("vertexColorWeight", 0), lutMinUniform = new vgl.floatUniform("lutMin", scalarRange[0]), lutMaxUniform = new vgl.floatUniform("lutMax", scalarRange[1]), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix"), samplerUniform = new vgl.uniform(gl.INT, "opacityLookup"), scalarsToColors = new vgl.uniform(gl.INT, "scalarsToColors"), useScalarsToColors = new vgl.uniform(gl.INT, "useScalarsToColors"), useVertexColors = new vgl.uniform(gl.INT, "useVertexColors"), pointSize = new vgl.uniform(gl.FLOAT_VEC2, "pointSize"), texture = new vgl.texture();
    return samplerUniform.set(0), scalarsToColors.set(1), useScalarsToColors.set(0), 
    useVertexColors.set(0), pointSize.set([ 1, 1 ]), prog.addVertexAttribute(posVertAttr, vgl.vertexAttributeKeys.Position), 
    prog.addVertexAttribute(colorVertAttr, vgl.vertexAttributeKeys.Color), prog.addUniform(heightUniform), 
    prog.addUniform(vertexColorWeightUniform), prog.addUniform(modelViewUniform), prog.addUniform(projectionUniform), 
    prog.addUniform(samplerUniform), prog.addUniform(useVertexColors), prog.addUniform(useScalarsToColors), 
    prog.addUniform(pointSize), prog.addShader(fragmentShader), prog.addShader(vertexShader), 
    mat.addAttribute(prog), mat.addAttribute(blend), lut && (prog.addUniform(scalarsToColors), 
    useScalarsToColors.set(1), prog.addUniform(lutMinUniform), prog.addUniform(lutMaxUniform), 
    lut.setTextureUnit(1), mat.addAttribute(lut)), texture.setImage(image), texture.setTextureUnit(0), 
    mat.addAttribute(texture), mat;
}, vgl.utils.createPlane = function(originX, originY, originZ, point1X, point1Y, point1Z, point2X, point2Y, point2Z) {
    "use strict";
    var mapper = new vgl.mapper(), planeSource = new vgl.planeSource(), mat = vgl.utils.createGeometryMaterial(), actor = new vgl.actor();
    return planeSource.setOrigin(originX, originY, originZ), planeSource.setPoint1(point1X, point1Y, point1Z), 
    planeSource.setPoint2(point2X, point2Y, point2Z), mapper.setGeometryData(planeSource.create()), 
    actor.setMapper(mapper), actor.setMaterial(mat), actor;
}, vgl.utils.createTexturePlane = function(originX, originY, originZ, point1X, point1Y, point1Z, point2X, point2Y, point2Z, isRgba) {
    "use strict";
    var mapper = new vgl.mapper(), planeSource = new vgl.planeSource(), mat = vgl.utils.createTextureMaterial(isRgba), actor = new vgl.actor();
    return planeSource.setOrigin(originX, originY, originZ), planeSource.setPoint1(point1X, point1Y, point1Z), 
    planeSource.setPoint2(point2X, point2Y, point2Z), mapper.setGeometryData(planeSource.create()), 
    actor.setMapper(mapper), actor.setMaterial(mat), actor;
}, vgl.utils.createPoints = function(positions, size, colors, texcoords, opacity) {
    "use strict";
    if (!positions) return console.log("[ERROR] Cannot create points without positions"), 
    null;
    var opacity = void 0 === opacity ? 1 : opacity, mapper = new vgl.mapper(), pointSource = new vgl.pointSource(), mat = vgl.utils.createPointGeometryMaterial(opacity), actor = new vgl.actor();
    return pointSource.setPositions(positions), colors && pointSource.setColors(colors), 
    texcoords && pointSource.setTextureCoordinates(texcoords), pointSource.setSize(size ? size : 1), 
    mapper.setGeometryData(pointSource.create()), actor.setMapper(mapper), actor.setMaterial(mat), 
    actor;
}, vgl.utils.createPointSprites = function(image, positions, colors, texcoords) {
    "use strict";
    if (!image) return console.log("[ERROR] Point sprites requires an image"), null;
    if (!positions) return console.log("[ERROR] Cannot create points without positions"), 
    null;
    var mapper = new vgl.mapper(), pointSource = new vgl.pointSource(), mat = vgl.utils.createPointSpritesMaterial(image), actor = new vgl.actor();
    return pointSource.setPositions(positions), colors && pointSource.setColors(colors), 
    texcoords && pointSource.setTextureCoordinates(texcoords), mapper.setGeometryData(pointSource.create()), 
    actor.setMapper(mapper), actor.setMaterial(mat), actor;
}, vgl.utils.createLines = function(positions, colors) {
    "use strict";
    if (!positions) return console.log("[ERROR] Cannot create points without positions"), 
    null;
    var mapper = new vgl.mapper(), lineSource = new vgl.lineSource(), mat = vgl.utils.createGeometryMaterial(), actor = new vgl.actor();
    return lineSource.setPositions(positions), colors && lineSource.setColors(colors), 
    mapper.setGeometryData(lineSource.create()), actor.setMapper(mapper), actor.setMaterial(mat), 
    actor;
}, vgl.utils.createColorLegend = function(varname, lookupTable, origin, width, height, countMajor, countMinor) {
    "use strict";
    function createLabels(varname, positions, range) {
        if (!positions) return void console.log("[error] Create labels requires positions (x,y,z) array");
        if (positions.length % 3 !== 0) return void console.log("[error] Create labels require positions array contain 3d points");
        if (!range) return void console.log("[error] Create labels requires Valid range");
        var i, actor = null, size = vgl.utils.computePowerOfTwo(48), index = 0, actors = [], origin = [], pt1 = [], pt2 = [], delta = positions[6] - positions[0], axisLabelOffset = 4;
        for (origin.length = 3, pt1.length = 3, pt2.length = 3, i = 0; 2 > i; ++i) index = i * (positions.length - 3), 
        origin[0] = positions[index] - delta, origin[1] = positions[index + 1] - 2 * delta, 
        origin[2] = positions[index + 2], pt1[0] = positions[index] + delta, pt1[1] = origin[1], 
        pt1[2] = origin[2], pt2[0] = origin[0], pt2[1] = positions[1], pt2[2] = origin[2], 
        actor = vgl.utils.createTexturePlane(origin[0], origin[1], origin[2], pt1[0], pt1[1], pt1[2], pt2[0], pt2[1], pt2[2], !0), 
        actor.setReferenceFrame(vgl.boundingObject.ReferenceFrame.Absolute), actor.material().setBinNumber(vgl.material.RenderBin.Overlay), 
        actor.material().addAttribute(vgl.utils.create2DTexture(range[i].toFixed(2).toString(), 12, null)), 
        actors.push(actor);
        return origin[0] = .5 * (positions[0] + positions[positions.length - 3] - size), 
        origin[1] = positions[1] + axisLabelOffset, origin[2] = positions[2], pt1[0] = origin[0] + size, 
        pt1[1] = origin[1], pt1[2] = origin[2], pt2[0] = origin[0], pt2[1] = origin[1] + size, 
        pt2[2] = origin[2], actor = vgl.utils.createTexturePlane(origin[0], origin[1], origin[2], pt1[0], pt1[1], pt1[2], pt2[0], pt2[1], pt2[2], !0), 
        actor.setReferenceFrame(vgl.boundingObject.ReferenceFrame.Absolute), actor.material().setBinNumber(vgl.material.RenderBin.Overlay), 
        actor.material().addAttribute(vgl.utils.create2DTexture(varname, 24, null)), actors.push(actor), 
        actors;
    }
    function createTicksAndLabels(varname, lut, originX, originY, originZ, pt1X, pt1Y, pt1Z, pt2X, pt2Y, pt2Z, countMajor, countMinor, heightMajor) {
        var width = pt2X - pt1X, index = null, delta = width / countMajor, positions = [], actor = null, actors = [];
        for (index = 0; countMajor >= index; ++index) positions.push(pt1X + delta * index), 
        positions.push(pt1Y), positions.push(pt1Z), positions.push(pt1X + delta * index), 
        positions.push(pt1Y + heightMajor), positions.push(pt1Z);
        return actor = vgl.utils.createLines(positions, null), actor.setReferenceFrame(vgl.boundingObject.ReferenceFrame.Absolute), 
        actor.material().setBinNumber(vgl.material.RenderBin.Overlay), actors.push(actor), 
        actors = actors.concat(createLabels(varname, positions, lut.range()));
    }
    if (!lookupTable) return console.log("[error] Invalid lookup table"), [];
    var pt1X = origin[0] + width, pt1Y = origin[1], pt1Z = 0, pt2X = origin[0], pt2Y = origin[1] + height, pt2Z = 0, actors = [], actor = null, mat = null, group = vgl.groupNode();
    return actor = vgl.utils.createTexturePlane(origin[0], origin[1], origin[2], pt1X, pt1Y, pt1Z, pt2X, pt2Y, pt2Z), 
    mat = actor.material(), mat.addAttribute(lookupTable), actor.setMaterial(mat), group.addChild(actor), 
    actor.setReferenceFrame(vgl.boundingObject.ReferenceFrame.Absolute), actors.push(actor), 
    actors = actors.concat(createTicksAndLabels(varname, lookupTable, origin[0], origin[1], origin[1], pt2X, pt1Y, pt1Z, pt1X, pt1Y, pt1Z, countMajor, countMinor, 5, 3));
}, vgl.utils.create2DTexture = function(textToWrite, textSize, color, font, alignment, baseline, bold) {
    "use strict";
    var canvas = document.getElementById("textRendering"), ctx = null, texture = vgl.texture();
    return font = font || "sans-serif", alignment = alignment || "center", baseline = baseline || "bottom", 
    "undefined" == typeof bold && (bold = !0), canvas || (canvas = document.createElement("canvas")), 
    ctx = canvas.getContext("2d"), canvas.setAttribute("id", "textRendering"), canvas.style.display = "none", 
    canvas.height = vgl.utils.computePowerOfTwo(8 * textSize), canvas.width = canvas.height, 
    ctx.fillStyle = "rgba(0, 0, 0, 0)", ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height), 
    ctx.fillStyle = "rgba(200, 85, 10, 1.0)", ctx.textAlign = alignment, ctx.textBaseline = baseline, 
    ctx.font = 4 * textSize + "px " + font, bold && (ctx.font = "bold " + ctx.font), 
    ctx.fillText(textToWrite, canvas.width / 2, canvas.height / 2, canvas.width), texture.setImage(canvas), 
    texture.updateDimensions(), texture;
}, vgl.picker = function() {
    "use strict";
    if (!(this instanceof vgl.picker)) return new vgl.picker();
    vgl.object.call(this);
    var m_actors = [];
    return this.getActors = function() {
        return m_actors;
    }, this.pick = function(selectionX, selectionY, renderer) {
        if ("undefined" == typeof selectionX) return 0;
        if ("undefined" == typeof selectionY) return 0;
        if ("undefined" == typeof renderer) return 0;
        m_actors = [];
        var actors, count, i, bb, tmin, tmax, tymin, tymax, tzmin, tzmax, actor, camera = renderer.camera(), width = renderer.width(), height = renderer.height(), fpoint = camera.focalPoint(), focusWorldPt = vec4.fromValues(fpoint[0], fpoint[1], fpoint[2], 1), focusDisplayPt = renderer.worldToDisplay(focusWorldPt, camera.viewMatrix(), camera.projectionMatrix(), width, height), displayPt = vec4.fromValues(selectionX, selectionY, focusDisplayPt[2], 1), worldPt = renderer.displayToWorld(displayPt, camera.viewMatrix(), camera.projectionMatrix(), width, height), cameraPos = camera.position(), ray = [];
        for (i = 0; 3 > i; ++i) ray[i] = worldPt[i] - cameraPos[i];
        for (actors = renderer.sceneRoot().children(), count = 0, i = 0; i < actors.length; ++i) if (actor = actors[i], 
        actor.visible() === !0) {
            if (bb = actor.bounds(), ray[0] >= 0 ? (tmin = (bb[0] - cameraPos[0]) / ray[0], 
            tmax = (bb[1] - cameraPos[0]) / ray[0]) : (tmin = (bb[1] - cameraPos[0]) / ray[0], 
            tmax = (bb[0] - cameraPos[0]) / ray[0]), ray[1] >= 0 ? (tymin = (bb[2] - cameraPos[1]) / ray[1], 
            tymax = (bb[3] - cameraPos[1]) / ray[1]) : (tymin = (bb[3] - cameraPos[1]) / ray[1], 
            tymax = (bb[2] - cameraPos[1]) / ray[1]), tmin > tymax || tymin > tmax) continue;
            if (tymin > tmin && (tmin = tymin), tmax > tymax && (tmax = tymax), ray[2] >= 0 ? (tzmin = (bb[4] - cameraPos[2]) / ray[2], 
            tzmax = (bb[5] - cameraPos[2]) / ray[2]) : (tzmin = (bb[5] - cameraPos[2]) / ray[2], 
            tzmax = (bb[4] - cameraPos[2]) / ray[2]), tmin > tzmax || tzmin > tmax) continue;
            tzmin > tmin && (tmin = tzmin), tmax > tzmax && (tmax = tzmax), m_actors[count++] = actor;
        }
        return count;
    }, this;
}, inherit(vgl.picker, vgl.object), vgl.shapefileReader = function() {
    "use strict";
    if (!(this instanceof vgl.shapefileReader)) return new vgl.shapefileReader();
    var m_that = this, SHP_NULL = 0, SHP_POINT = 1, SHP_POLYGON = 5, SHP_POLYLINE = 3;
    return this.int8 = function(data, offset) {
        return data.charCodeAt(offset);
    }, this.bint32 = function(data, offset) {
        return ((255 & data.charCodeAt(offset)) << 24) + ((255 & data.charCodeAt(offset + 1)) << 16) + ((255 & data.charCodeAt(offset + 2)) << 8) + (255 & data.charCodeAt(offset + 3));
    }, this.lint32 = function(data, offset) {
        return ((255 & data.charCodeAt(offset + 3)) << 24) + ((255 & data.charCodeAt(offset + 2)) << 16) + ((255 & data.charCodeAt(offset + 1)) << 8) + (255 & data.charCodeAt(offset));
    }, this.bint16 = function(data, offset) {
        return ((255 & data.charCodeAt(offset)) << 8) + (255 & data.charCodeAt(offset + 1));
    }, this.lint16 = function(data, offset) {
        return ((255 & data.charCodeAt(offset + 1)) << 8) + (255 & data.charCodeAt(offset));
    }, this.ldbl64 = function(data, offset) {
        var b0 = 255 & data.charCodeAt(offset), b1 = 255 & data.charCodeAt(offset + 1), b2 = 255 & data.charCodeAt(offset + 2), b3 = 255 & data.charCodeAt(offset + 3), b4 = 255 & data.charCodeAt(offset + 4), b5 = 255 & data.charCodeAt(offset + 5), b6 = 255 & data.charCodeAt(offset + 6), b7 = 255 & data.charCodeAt(offset + 7), sign = 1 - 2 * (b7 >> 7), exp = ((127 & b7) << 4) + ((240 & b6) >> 4) - 1023, frac = (15 & b6) * Math.pow(2, 48) + b5 * Math.pow(2, 40) + b4 * Math.pow(2, 32) + b3 * Math.pow(2, 24) + b2 * Math.pow(2, 16) + b1 * Math.pow(2, 8) + b0;
        return sign * (1 + frac * Math.pow(2, -52)) * Math.pow(2, exp);
    }, this.lfloat32 = function(data, offset) {
        var b0 = 255 & data.charCodeAt(offset), b1 = 255 & data.charCodeAt(offset + 1), b2 = 255 & data.charCodeAt(offset + 2), b3 = 255 & data.charCodeAt(offset + 3), sign = 1 - 2 * (b3 >> 7), exp = ((127 & b3) << 1) + ((254 & b2) >> 7) - 127, frac = (127 & b2) * Math.pow(2, 16) + b1 * Math.pow(2, 8) + b0;
        return sign * (1 + frac * Math.pow(2, -23)) * Math.pow(2, exp);
    }, this.str = function(data, offset, length) {
        for (var chars = [], index = offset; offset + length > index; ) {
            var c = data[index];
            if (0 === c.charCodeAt(0)) break;
            chars.push(c), index++;
        }
        return chars.join("");
    }, this.readHeader = function(data) {
        var code = this.bint32(data, 0), length = this.bint32(data, 24), version = this.lint32(data, 28), shapetype = this.lint32(data, 32), xmin = this.ldbl64(data, 36), ymin = this.ldbl64(data, 44), xmax = this.ldbl64(data, 52), ymax = this.ldbl64(data, 60);
        return {
            code: code,
            length: length,
            version: version,
            shapetype: shapetype,
            bounds: new Box(vect(xmin, ymin), vect(xmax, ymax))
        };
    }, this.loadShx = function(data) {
        for (var indices = [], appendIndex = function(offset) {
            return indices.push(2 * m_that.bint32(data, offset)), offset + 8;
        }, offset = 100; offset < data.length; ) offset = appendIndex(offset);
        return indices;
    }, this.Shapefile = function(options) {
        var path = options.path;
        $.ajax({
            url: path + ".shx",
            mimeType: "text/plain; charset=x-user-defined",
            success: function(data) {
                var indices = this.loadShx(data);
                $.ajax({
                    url: path + ".shp",
                    mimeType: "text/plain; charset=x-user-defined",
                    success: function(data) {
                        $.ajax({
                            url: path + ".dbf",
                            mimeType: "text/plain; charset=x-user-defined",
                            success: function(dbf_data) {
                                var layer = this.loadShp(data, dbf_data, indices, options);
                                options.success(layer);
                            }
                        });
                    }
                });
            }
        });
    }, this.localShapefile = function(options) {
        var shxFile = options.shx, shpFile = options.shp, dbfFile = options.dbf, shxReader = new FileReader();
        shxReader.onloadend = function() {
            var indices = m_that.loadShx(shxReader.result), shpReader = new FileReader();
            shpReader.onloadend = function() {
                var shpData = shpReader.result, dbfReader = new FileReader();
                dbfReader.onloadend = function() {
                    var dbfData = dbfReader.result, layer = m_that.loadShp(shpData, dbfData, indices, options);
                    options.success(layer);
                }, dbfReader.readAsBinaryString(dbfFile);
            }, shpReader.readAsBinaryString(shpFile);
        }, shxReader.readAsBinaryString(shxFile);
    }, this.loadDBF = function(data) {
        var readHeader = function(offset) {
            var name = m_that.str(data, offset, 10), type = m_that.str(data, offset + 11, 1), length = m_that.int8(data, offset + 16);
            return {
                name: name,
                type: type,
                length: length
            };
        }, level = m_that.int8(data, 0);
        if (4 == level) throw "Level 7 dBASE not supported";
        for (var num_entries = (m_that.int8(data, 1), m_that.int8(data, 2), m_that.int8(data, 3), 
        m_that.lint32(data, 4)), header_size = m_that.lint16(data, 8), record_size = m_that.lint16(data, 10), FIELDS_START = 32, HEADER_LENGTH = 32, header_offset = FIELDS_START, headers = []; header_size - 1 > header_offset; ) headers.push(readHeader(header_offset)), 
        header_offset += HEADER_LENGTH;
        for (var records = [], record_offset = header_size; header_size + num_entries * record_size > record_offset; ) {
            var declare = m_that.str(data, record_offset, 1);
            if ("*" == declare) record_offset += record_size; else {
                record_offset++;
                for (var record = {}, i = 0; i < headers.length; i++) {
                    var value, header = headers[i];
                    "C" == header.type ? value = m_that.str(data, record_offset, header.length).trim() : "N" == header.type && (value = parseFloat(m_that.str(data, record_offset, header.length))), 
                    record_offset += header.length, record[header.name] = value;
                }
                records.push(record);
            }
        }
        return records;
    }, this.loadShp = function(data, dbf_data, indices) {
        for (var features = [], readRing = function(offset, start, end) {
            for (var ring = [], i = end - 1; i >= start; i--) {
                var x = m_that.ldbl64(data, offset + 16 * i), y = m_that.ldbl64(data, offset + 16 * i + 8);
                ring.push([ x, y ]);
            }
            return ring;
        }, readRecord = function(offset) {
            var record_offset = (m_that.bint32(data, offset), m_that.bint32(data, offset + 4), 
            offset + 8), geom_type = m_that.lint32(data, record_offset);
            if (geom_type == SHP_NULL) console.log("NULL Shape"); else if (geom_type == SHP_POINT) {
                var x = m_that.ldbl64(data, record_offset + 4), y = m_that.ldbl64(data, record_offset + 12);
                features.push({
                    type: "Point",
                    attr: {},
                    geom: [ [ x, y ] ]
                });
            } else if (geom_type == SHP_POLYGON) {
                for (var num_parts = m_that.lint32(data, record_offset + 36), num_points = m_that.lint32(data, record_offset + 40), parts_start = offset + 52, points_start = offset + 52 + 4 * num_parts, rings = [], i = 0; num_parts > i; i++) {
                    var end, start = m_that.lint32(data, parts_start + 4 * i);
                    end = num_parts > i + 1 ? m_that.lint32(data, parts_start + 4 * (i + 1)) : num_points;
                    var ring = readRing(points_start, start, end);
                    rings.push(ring);
                }
                features.push({
                    type: "Polygon",
                    attr: {},
                    geom: [ rings ]
                });
            } else {
                if (geom_type != SHP_POLYLINE) throw "Not Implemented: " + geom_type;
                for (var num_parts = m_that.lint32(data, record_offset + 36), num_points = m_that.lint32(data, record_offset + 40), parts_start = offset + 52, points_start = offset + 52 + 4 * num_parts, rings = [], i = 0; num_parts > i; i++) {
                    var end, start = m_that.lint32(data, parts_start + 4 * i);
                    end = num_parts > i + 1 ? m_that.lint32(data, parts_start + 4 * (i + 1)) : num_points;
                    var ring = readRing(points_start, start, end);
                    rings.push(ring);
                }
                features.push({
                    type: "Polyline",
                    attr: {},
                    geom: [ rings ]
                });
            }
        }, attr = this.loadDBF(dbf_data), i = 0; i < indices.length; i++) {
            var offset = indices[i];
            readRecord(offset);
        }
        for (var layer = [], i = 0; i < features.length; i++) {
            var feature = features[i];
            feature.attr = attr[i], layer.push(feature);
        }
        return layer;
    }, this;
}, vgl.vtkReader = function() {
    "use strict";
    if (!(this instanceof vgl.vtkReader)) return new vgl.vtkReader();
    var m_base64Chars = [ "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "/" ], m_reverseBase64Chars = [], m_vtkRenderedList = {}, m_vtkObjectCount = 0, m_vtkScene = null, m_node = null, END_OF_INPUT = -1, m_base64Str = "", m_base64Count = 0, m_pos = 0, m_viewer = null, i = 0;
    if (0 === m_reverseBase64Chars.length) for (i = 0; i < m_base64Chars.length; i++) m_reverseBase64Chars[m_base64Chars[i]] = i;
    return this.ntos = function(n) {
        var unN;
        return unN = n.toString(16), 1 === unN.length && (unN = "0" + unN), unN = "%" + unN, 
        unescape(unN);
    }, this.readReverseBase64 = function() {
        var nextCharacter;
        if (!m_base64Str) return END_OF_INPUT;
        for (;;) {
            if (m_base64Count >= m_base64Str.length) return END_OF_INPUT;
            if (nextCharacter = m_base64Str.charAt(m_base64Count), m_base64Count++, m_reverseBase64Chars[nextCharacter]) return m_reverseBase64Chars[nextCharacter];
            if ("A" === nextCharacter) return 0;
        }
        return END_OF_INPUT;
    }, this.decode64 = function(str) {
        var result = "", inBuffer = new Array(4), done = !1;
        for (m_base64Str = str, m_base64Count = 0; !done && (inBuffer[0] = this.readReverseBase64()) !== END_OF_INPUT && (inBuffer[1] = this.readReverseBase64()) !== END_OF_INPUT; ) inBuffer[2] = this.readReverseBase64(), 
        inBuffer[3] = this.readReverseBase64(), result += this.ntos(inBuffer[0] << 2 & 255 | inBuffer[1] >> 4), 
        inBuffer[2] !== END_OF_INPUT ? (result += this.ntos(inBuffer[1] << 4 & 255 | inBuffer[2] >> 2), 
        inBuffer[3] !== END_OF_INPUT ? result += this.ntos(inBuffer[2] << 6 & 255 | inBuffer[3]) : done = !0) : done = !0;
        return result;
    }, this.readNumber = function(ss) {
        var v = ss[m_pos++] + (ss[m_pos++] << 8) + (ss[m_pos++] << 16) + (ss[m_pos++] << 24);
        return v;
    }, this.readF3Array = function(numberOfPoints, ss) {
        var i, size = 4 * numberOfPoints * 3, test = new Int8Array(size), points = null;
        for (i = 0; size > i; i++) test[i] = ss[m_pos++];
        return points = new Float32Array(test.buffer);
    }, this.readColorArray = function(numberOfPoints, ss, vglcolors) {
        var i, idx = 0, tmp = new Array(3 * numberOfPoints);
        for (i = 0; numberOfPoints > i; i++) tmp[idx++] = ss[m_pos++] / 255, tmp[idx++] = ss[m_pos++] / 255, 
        tmp[idx++] = ss[m_pos++] / 255, m_pos++;
        vglcolors.insert(tmp);
    }, this.parseObject = function(vtkObject) {
        var size, shaderProg, opacityUniform, geom = new vgl.geometryData(), mapper = vgl.mapper(), ss = [], type = null, data = null, matrix = null, material = null, actor = null;
        for (data = atob(vtkObject.data), i = 0; i < data.length; i++) ss[i] = 255 & data.charCodeAt(i);
        return m_pos = 0, size = this.readNumber(ss), type = String.fromCharCode(ss[m_pos++]), 
        geom.setName(type), "L" === type ? (matrix = this.parseLineData(geom, ss), material = vgl.utils.createGeometryMaterial()) : "M" === type ? (matrix = this.parseMeshData(geom, ss), 
        material = vgl.utils.createPhongMaterial()) : "P" === type ? (matrix = this.parsePointData(geom, ss), 
        material = vgl.utils.createGeometryMaterial()) : "C" === type ? (matrix = this.parseColorMapData(geom, ss, size), 
        material = vgl.utils.createGeometryMaterial()) : console.log("Ignoring unrecognized encoded data type " + type), 
        mapper.setGeometryData(geom), vtkObject.hasTransparency && (shaderProg = material.shaderProgram(), 
        opacityUniform = shaderProg.uniform("opacity"), shaderProg.addUniform(new vgl.floatUniform("opacity", .5)), 
        material.setBinNumber(1e3)), actor = vgl.actor(), actor.setMapper(mapper), actor.setMaterial(material), 
        actor.setMatrix(mat4.transpose(mat4.create(), matrix)), actor;
    }, this.parseLineData = function(geom, ss) {
        var numberOfIndex, numberOfPoints, points, temp, index, size, m, i, vglpoints = null, vglcolors = null, vgllines = null, matrix = mat4.create(), p = null, idx = 0;
        for (numberOfPoints = this.readNumber(ss), p = new Array(3 * numberOfPoints), vglpoints = new vgl.sourceDataP3fv(), 
        points = this.readF3Array(numberOfPoints, ss), i = 0; numberOfPoints > i; i++) p[idx++] = points[3 * i], 
        p[idx++] = points[3 * i + 1], p[idx++] = points[3 * i + 2];
        for (vglpoints.insert(p), geom.addSource(vglpoints), vglcolors = new vgl.sourceDataC3fv(), 
        this.readColorArray(numberOfPoints, ss, vglcolors), geom.addSource(vglcolors), vgllines = new vgl.lines(), 
        geom.addPrimitive(vgllines), numberOfIndex = this.readNumber(ss), temp = new Int8Array(2 * numberOfIndex), 
        i = 0; 2 * numberOfIndex > i; i++) temp[i] = ss[m_pos++];
        for (index = new Uint16Array(temp.buffer), vgllines.setIndices(index), vgllines.setPrimitiveType(gl.LINES), 
        size = 64, temp = new Int8Array(size), i = 0; size > i; i++) temp[i] = ss[m_pos++];
        return m = new Float32Array(temp.buffer), mat4.copy(matrix, m), matrix;
    }, this.parseMeshData = function(geom, ss) {
        var numberOfIndex, numberOfPoints, points, temp, index, size, m, i, tcoord, vglpoints = null, vglcolors = null, normals = null, matrix = mat4.create(), vgltriangles = null, pn = null, idx = 0;
        for (numberOfPoints = this.readNumber(ss), pn = new Array(6 * numberOfPoints), vglpoints = new vgl.sourceDataP3N3f(), 
        points = this.readF3Array(numberOfPoints, ss), normals = this.readF3Array(numberOfPoints, ss), 
        i = 0; numberOfPoints > i; i++) pn[idx++] = points[3 * i], pn[idx++] = points[3 * i + 1], 
        pn[idx++] = points[3 * i + 2], pn[idx++] = normals[3 * i], pn[idx++] = normals[3 * i + 1], 
        pn[idx++] = normals[3 * i + 2];
        for (vglpoints.insert(pn), geom.addSource(vglpoints), vglcolors = new vgl.sourceDataC3fv(), 
        this.readColorArray(numberOfPoints, ss, vglcolors), geom.addSource(vglcolors), temp = [], 
        vgltriangles = new vgl.triangles(), numberOfIndex = this.readNumber(ss), temp = new Int8Array(2 * numberOfIndex), 
        i = 0; 2 * numberOfIndex > i; i++) temp[i] = ss[m_pos++];
        for (index = new Uint16Array(temp.buffer), vgltriangles.setIndices(index), geom.addPrimitive(vgltriangles), 
        size = 64, temp = new Int8Array(size), i = 0; size > i; i++) temp[i] = ss[m_pos++];
        return m = new Float32Array(temp.buffer), mat4.copy(matrix, m), tcoord = null, matrix;
    }, this.parsePointData = function(geom, ss) {
        var numberOfPoints, points, indices, temp, size, m, matrix = mat4.create(), vglpoints = null, vglcolors = null, vglVertexes = null, p = null, idx = 0;
        for (numberOfPoints = this.readNumber(ss), p = new Array(3 * numberOfPoints), vglpoints = new vgl.sourceDataP3fv(), 
        points = this.readF3Array(numberOfPoints, ss), indices = new Uint16Array(numberOfPoints), 
        i = 0; numberOfPoints > i; i++) indices[i] = i, p[idx++] = points[3 * i], p[idx++] = points[3 * i + 1], 
        p[idx++] = points[3 * i + 2];
        for (vglpoints.insert(p), geom.addSource(vglpoints), vglcolors = new vgl.sourceDataC3fv(), 
        this.readColorArray(numberOfPoints, ss, vglcolors), geom.addSource(vglcolors), vglVertexes = new vgl.points(), 
        vglVertexes.setIndices(indices), geom.addPrimitive(vglVertexes), size = 64, temp = new Int8Array(size), 
        i = 0; size > i; i++) temp[i] = ss[m_pos++];
        return m = new Float32Array(temp.buffer), mat4.copy(matrix, m), matrix;
    }, this.parseColorMapData = function() {
        return null;
    }, this.parseSceneMetadata = function(renderer, layer) {
        var bgc, localWidth, localHeight, sceneRenderer = m_vtkScene.Renderers[layer], camera = renderer.camera();
        localWidth = (sceneRenderer.size[0] - sceneRenderer.origin[0]) * m_node.width, localHeight = (sceneRenderer.size[1] - sceneRenderer.origin[1]) * m_node.height, 
        renderer.resize(localWidth, localHeight), camera.setCenterOfRotation([ sceneRenderer.LookAt[1], sceneRenderer.LookAt[2], sceneRenderer.LookAt[3] ]), 
        camera.setViewAngleDegrees(sceneRenderer.LookAt[0]), camera.setPosition(sceneRenderer.LookAt[7], sceneRenderer.LookAt[8], sceneRenderer.LookAt[9]), 
        camera.setFocalPoint(sceneRenderer.LookAt[1], sceneRenderer.LookAt[2], sceneRenderer.LookAt[3]), 
        camera.setViewUpDirection(sceneRenderer.LookAt[4], sceneRenderer.LookAt[5], sceneRenderer.LookAt[6]), 
        0 === layer ? (bgc = sceneRenderer.Background1, renderer.setBackgroundColor(bgc[0], bgc[1], bgc[2], 1)) : renderer.setResizable(!1), 
        renderer.setLayer(layer);
    }, this.initScene = function() {
        var renderer, layer;
        if (null === m_vtkScene) return m_viewer;
        for (layer = m_vtkScene.Renderers.length - 1; layer >= 0; layer--) renderer = this.getRenderer(layer), 
        this.parseSceneMetadata(renderer, layer);
        return m_viewer;
    }, this.createViewer = function(node) {
        var interactorStyle;
        return null === m_viewer && (m_node = node, m_viewer = vgl.viewer(node), m_viewer.init(), 
        m_vtkRenderedList[0] = m_viewer.renderWindow().activeRenderer(), m_viewer.renderWindow().resize(node.width, node.height), 
        interactorStyle = vgl.pvwInteractorStyle(), m_viewer.setInteractorStyle(interactorStyle)), 
        m_viewer;
    }, this.deleteViewer = function() {
        m_vtkRenderedList = {}, m_viewer = null;
    }, this.updateCanvas = function(node) {
        return m_node = node, m_viewer.renderWindow().resize(node.width, node.height), m_viewer;
    }, this.numObjects = function() {
        return m_vtkObjectCount;
    }, this.getRenderer = function(layer) {
        var renderer;
        return renderer = m_vtkRenderedList[layer], (null === renderer || "undefined" == typeof renderer) && (renderer = new vgl.renderer(), 
        renderer.setResetScene(!1), renderer.setResetClippingRange(!1), m_viewer.renderWindow().addRenderer(renderer), 
        0 !== layer && renderer.camera().setClearMask(vgl.GL.DepthBufferBit), m_vtkRenderedList[layer] = renderer), 
        renderer;
    }, this.setVtkScene = function(scene) {
        m_vtkScene = scene;
    }, this;
}, vgl.DataBuffers = function(initialSize) {
    if (!(this instanceof vgl.DataBuffers)) return new vgl.DataBuffers(initialSize);
    var size, data = {};
    size = initialSize ? initialSize : 256;
    var current = 0, copyArray = function(dst, src, start, count) {
        dst || console.log("ack"), start || (start = 0), count || (count = src.length);
        for (var i = 0; count > i; i++) dst[start + i] = src[i];
    }, resize = function(min_expand) {
        for (var new_size = size; min_expand > new_size; ) new_size *= 2;
        size = new_size;
        for (var name in data) {
            var newArray = new Float32Array(new_size * data[name].len), oldArray = data[name].array;
            copyArray(newArray, oldArray), data[name].array = newArray, data[name].dirty = !0;
        }
    };
    this.create = function(name, len) {
        if (!len) throw "Length of buffer must be a positive integer";
        var array = new Float32Array(size * len);
        data[name] = {
            array: array,
            len: len,
            dirty: !1
        };
    }, this.alloc = function(num) {
        current + num >= size && resize(current + num);
        var start = current;
        return current += num, start;
    }, this.get = function(name) {
        return data[name].array;
    }, this.write = function(name, array, start, count) {
        copyArray(data[name].array, array, start * data[name].len, count * data[name].len), 
        data[name].dirty = !0;
    }, this.repeat = function(name, elem, start, count) {
        for (var i = 0; count > i; i++) copyArray(data[name].array, elem, (start + i) * data[name].len, data[name].len);
        data[name].dirty = !0;
    }, this.count = function() {
        return current;
    }, this.data = function(name) {
        return data[name].array;
    };
};

var ogs;

ogs = window && void 0 !== window.ogs ? window.ogs : {}, ogs.namespace = function(ns_string) {
    "use strict";
    var i, parts = ns_string.split("."), parent = ogs;
    for ("ogs" === parts[0] && (parts = parts.slice(1)), i = 0; i < parts.length; i += 1) void 0 === parent[parts[i]] && (parent[parts[i]] = {}), 
    parent = parent[parts[i]];
    return parent;
};

var geo = ogs.namespace("geo");

window.geo = geo, geo.renderers = {}, geo.features = {}, geo.fileReaders = {}, inherit = function(C, P) {
    "use strict";
    var F = function() {};
    F.prototype = P.prototype, C.prototype = new F(), C.uber = P.prototype, C.prototype.constructor = C;
}, Object.size = function(obj) {
    "use strict";
    var size = 0, key = null;
    for (key in obj) obj.hasOwnProperty(key) && (size += 1);
    return size;
}, geo.registerFileReader = function(name, func) {
    "use strict";
    void 0 === geo.fileReaders && (geo.fileReaders = {}), geo.fileReaders[name] = func;
}, geo.createFileReader = function(name, opts) {
    "use strict";
    return geo.fileReaders.hasOwnProperty(name) ? geo.fileReaders[name](opts) : null;
}, geo.registerRenderer = function(name, func) {
    "use strict";
    void 0 === geo.renderers && (geo.renderers = {}), geo.renderers[name] = func;
}, geo.createRenderer = function(name, layer, canvas) {
    "use strict";
    if (geo.renderers.hasOwnProperty(name)) {
        var ren = geo.renderers[name]({
            layer: layer,
            canvas: canvas
        });
        return ren._init(), ren;
    }
    return null;
}, geo.registerFeature = function(category, name, func) {
    "use strict";
    void 0 === geo.features && (geo.features = {}), category in geo.features || (geo.features[category] = {}), 
    geo.features[category][name] = func;
}, geo.createFeature = function(name, layer, renderer, arg) {
    "use strict";
    var category = renderer.api(), options = {
        layer: layer,
        renderer: renderer
    };
    return category in geo.features && name in geo.features[category] ? (void 0 !== arg && $.extend(!0, options, arg), 
    geo.features[category][name](options)) : null;
}, geo.registerLayer = function(name, func) {
    "use strict";
    void 0 === geo.layers && (geo.layers = {}), geo.layers[name] = func;
}, geo.createLayer = function(name, map, arg) {
    "use strict";
    var options = {
        map: map,
        renderer: "vglRenderer"
    }, layer = null;
    return name in geo.layers ? (void 0 !== arg && $.extend(!0, options, arg), layer = geo.layers[name](options), 
    layer._init(), layer) : null;
}, window.requestAnimationFrame || (window.requestAnimationFrame = function(func) {
    "use strict";
    window.setTimeout(func, 15);
}), geo.version = "0.1.0", function() {
    "use strict";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    geo.util = {
        isFunction: function(f) {
            return "function" == typeof f;
        },
        ensureFunction: function(f) {
            return geo.util.isFunction(f) ? f : function() {
                return f;
            };
        },
        randomString: function(n) {
            var s, i, r;
            for (n = n || 8, s = "", i = 0; n > i; i += 1) r = Math.floor(Math.random() * chars.length), 
            s += chars.substring(r, r + 1);
            return s;
        }
    };
}(), function() {
    "use strict";
    function vect(x, y) {
        return new Vector2D(x, y);
    }
    var RangeNode = function(elem, start, end, current) {
        this.data = elem[current], this.left = null, this.right = null, start != current && (this.left = new RangeNode(elem, start, current - 1, parseInt((start + (current - 1)) / 2, 10))), 
        end != current && (this.right = new RangeNode(elem, current + 1, end, parseInt((end + (current + 1)) / 2, 10))), 
        this.subtree = [];
        for (var i = start; end >= i; i++) this.subtree.push(elem[i]);
        this.subtree.sort(function(a, b) {
            return a.y - b.y;
        });
        var xrange = function(b) {
            return b.x_in(elem[start]) && b.x_in(elem[end]);
        };
        this.yrange = function(b, start, end) {
            return b.y_in(this.subtree[start]) && b.y_in(this.subtree[end]);
        }, this.subquery = function(result, box, start, end, current) {
            if (this.yrange(box, start, end)) for (var i = start; end >= i; i++) result.push(this.subtree[i]); else box.y_in(this.subtree[current]) && result.push(this.subtree[current]), 
            box.y_left(this.subtree[current]) ? current != end && this.subquery(result, box, current + 1, end, parseInt((end + (current + 1)) / 2, 10)) : box.x_right(this.subtree[current]) ? current != start && this.subquery(result, box, start, current - 1, parseInt((start + (current - 1)) / 2, 10)) : (current != end && this.subquery(result, box, current + 1, end, parseInt((end + (current + 1)) / 2, 10)), 
            current != start && this.subquery(result, box, start, current - 1, parseInt((start + (current - 1)) / 2, 10)));
        }, this.search = function(result, box) {
            return xrange(box) ? void this.subquery(result, box, 0, this.subtree.length - 1, parseInt((this.subtree.length - 1) / 2, 10)) : (box.contains(this.data) && result.push(this.data), 
            void (box.x_left(this.data) ? this.right && this.right.search(result, box) : box.x_right(this.data) ? this.left && this.left.search(result, box) : (this.left && this.left.search(result, box), 
            this.right && this.right.search(result, box))));
        };
    }, RangeTree = function(elem) {
        elem.sort(function(a, b) {
            return a.x - b.x;
        }), this.root = elem.length > 0 ? new RangeNode(elem, 0, elem.length - 1, parseInt((elem.length - 1) / 2, 10)) : null, 
        this.search = function(_box) {
            if (!this.root) return [];
            var box = _box.clone(), result = [];
            return this.root.search(result, box), result;
        };
    }, Box = function(v1, v2) {
        this.min = v1.clone(), this.max = v2.clone(), this.contains = function(p) {
            return v1.x <= p.x && v2.x >= p.x && v1.y <= p.y && v2.y >= p.y;
        }, this.x_in = function(p) {
            return v1.x <= p.x && v2.x >= p.x;
        }, this.x_left = function(p) {
            return v1.x >= p.x;
        }, this.x_right = function(p) {
            return v2.x <= p.x;
        }, this.y_in = function(p) {
            return v1.y <= p.y && v2.y >= p.y;
        }, this.y_left = function(p) {
            return v1.y >= p.y;
        }, this.y_right = function(p) {
            return v2.y <= p.y;
        }, this.area = function() {
            return (this.max.x - this.min.x) * (this.max.y - this.min.y);
        }, this.height = function() {
            return this.max.y - this.min.y;
        }, this.width = function() {
            return this.max.x - this.min.x;
        }, this.vertex = function(index) {
            switch (index) {
              case 0:
                return this.min.clone();

              case 1:
                return new vect(this.max.x, this.min.y);

              case 2:
                return this.max.clone();

              case 3:
                return new vect(this.min.x, this.max.y);

              default:
                throw "Index out of bounds: " + index;
            }
        }, this.intersects = function(box) {
            for (var i = 0; 4 > i; i++) for (var j = 0; 4 > j; j++) if (vect.intersects(this.vertex(i), this.vertex((i + 1) % 4), box.vertex(j), box.vertex((j + 1) % 4))) return !0;
            return this.contains(box.min) && this.contains(box.max) && this.contains(new vect(box.min.x, box.max.y)) && this.contains(new vect(box.max.x, box.min.y)) ? !0 : box.contains(this.min) && box.contains(this.max) && box.contains(new vect(this.min.x, this.max.y)) && box.contains(new vect(this.max.x, this.min.y)) ? !0 : !1;
        }, this.union = function(b) {
            this.min.x = Math.min(this.min.x, b.min.x), this.min.y = Math.min(this.min.y, b.min.y), 
            this.max.x = Math.max(this.max.x, b.max.x), this.max.y = Math.max(this.max.y, b.max.y);
        }, this.centroid = function() {
            return new vect((this.max.x + this.min.x) / 2, (this.max.y + this.min.y) / 2);
        }, this.clone = function() {
            return new Box(v1, v2);
        };
    }, Vector2D = function(x, y) {
        this.x = x, this.y = y, this.add = function(v) {
            return this.x += v.x, this.y += v.y, this;
        }, this.sub = function(v) {
            return this.x -= v.x, this.y -= v.y, this;
        }, this.scale = function(s) {
            return this.x *= s, this.y *= s, this;
        }, this.length = function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }, this.normalize = function() {
            var scale = this.length();
            return 0 === scale ? this : (this.x /= scale, this.y /= scale, this);
        }, this.div = function(v) {
            return this.x /= v.x, this.y /= v.y, this;
        }, this.floor = function() {
            return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
        }, this.zero = function(tol) {
            return tol = tol || 0, this.length() <= tol;
        }, this.dot = function(v) {
            return this.x * v.x + this.y * v.y;
        }, this.cross = function(v) {
            return this.x * v.y - this.y * v.x;
        }, this.rotate = function(omega) {
            var cos = Math.cos(omega), sin = Math.sin(omega);
            return xp = cos * this.x - sin * this.y, yp = sin * this.x + cos * this.y, this.x = xp, 
            this.y = yp, this;
        }, this.clone = function() {
            return new Vector2D(this.x, this.y);
        }, this.array = function() {
            return [ this.x, this.y ];
        };
    };
    vect.scale = function(v, s) {
        return v.clone().scale(s);
    }, vect.add = function(v1, v2) {
        return v1.clone().add(v2);
    }, vect.sub = function(v1, v2) {
        return v1.clone().sub(v2);
    }, vect.dist = function(v1, v2) {
        return v1.clone().sub(v2).length();
    }, vect.dir = function(v1, v2) {
        return v1.clone().sub(v2).normalize();
    }, vect.dot = function(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }, vect.cross = function(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }, vect.left = function(a, b, c, tol) {
        tol || (tol = 0);
        var v1 = vect.sub(b, a), v2 = vect.sub(c, a);
        return vect.cross(v1, v2) >= -tol;
    }, vect.intersects = function(a, b, c, d, tol) {
        return tol || (tol = 0), vect.left(a, b, c, tol) != vect.left(a, b, d, tol) && vect.left(c, d, b, tol) != vect.left(c, d, a, tol);
    }, vect.intersect2dt = function(a, b, c, d) {
        var denom = a.x * (d.y - c.y) + b.x * (c.y - d.y) + d.x * (b.y - a.y) + c.x * (a.y - b.y);
        if (0 === denom) return 1/0;
        var num_t = (a.x * (d.y - c.y) + c.x * (a.y - d.y) + d.x * (c.y - a.y), -(a.x * (c.y - b.y) + b.x * (a.y - c.y) + c.x * (b.y - a.y))), t = num_t / denom;
        return t;
    }, vect.intersect2dpos = function(a, b, c, d) {
        var denom = a.x * (d.y - c.y) + b.x * (c.y - d.y) + d.x * (b.y - a.y) + c.x * (a.y - b.y);
        if (0 === denom) return 1/0;
        var num_s = a.x * (d.y - c.y) + c.x * (a.y - d.y) + d.x * (c.y - a.y), s = num_s / denom, dir = vect.sub(b, a);
        return dir.scale(s), vect.add(a, dir);
    }, vect.rotate = function(v, omega) {
        var cos = Math.cos(omega), sin = Math.sin(omega);
        xp = cos * v.x - sin * v.y, yp = sin * v.x + cos * v.y;
        var c = new vect(xp, yp);
        return c;
    }, vect.normalize = function(v) {
        return v.clone().normalize();
    }, geo.util.RangeTree = RangeTree, geo.util.Box = Box, geo.util.vect = vect;
}(), geo.object = function() {
    "use strict";
    if (!(this instanceof geo.object)) return new geo.object();
    var m_this = this, m_eventHandlers = {}, m_idleHandlers = [], m_deferredCount = 0;
    return this.onIdle = function(handler) {
        m_deferredCount ? m_idleHandlers.push(handler) : handler();
    }, this.addDeferred = function(defer) {
        m_deferredCount += 1, defer.done(function() {
            m_deferredCount -= 1, m_deferredCount || m_idleHandlers.splice(0, m_idleHandlers.length).forEach(function(handler) {
                handler();
            });
        });
    }, this.geoOn = function(event, handler) {
        return Array.isArray(event) ? (event.forEach(function(e) {
            m_this.geoOn(e, handler);
        }), m_this) : (m_eventHandlers.hasOwnProperty(event) || (m_eventHandlers[event] = []), 
        m_eventHandlers[event].push(handler), m_this);
    }, this.geoTrigger = function(event, args) {
        return Array.isArray(event) ? (event.forEach(function(e) {
            m_this.geoTrigger(e, args);
        }), m_this) : (m_eventHandlers.hasOwnProperty(event) && m_eventHandlers[event].forEach(function(handler) {
            handler(args);
        }), m_this);
    }, this.geoOff = function(event, arg) {
        if (Array.isArray(event)) return event.forEach(function(e) {
            m_this.geoOff(e, arg);
        }), m_this;
        if (arg) {
            if (Array.isArray(arg)) return arg.forEach(function(handler) {
                m_this.geoOff(event, handler);
            }), m_this;
        } else m_eventHandlers[event] = [];
        return m_eventHandlers.hasOwnProperty(event) && (m_eventHandlers[event] = m_eventHandlers[event].filter(function(f) {
            return f !== arg;
        })), m_this;
    }, vgl.object.call(this), this;
}, inherit(geo.object, vgl.object), geo.sceneObject = function(arg) {
    "use strict";
    if (!(this instanceof geo.sceneObject)) return new geo.sceneObject();
    geo.object.call(this, arg);
    var m_this = this, m_parent = null, m_children = [], s_trigger = this.geoTrigger, s_addDeferred = this.addDeferred, s_onIdle = this.onIdle;
    return this.addDeferred = function(defer) {
        m_parent ? m_parent.addDeferred(defer) : s_addDeferred(defer);
    }, this.onIdle = function(handler) {
        m_parent ? m_parent.onIdle(handler) : s_onIdle(handler);
    }, this.parent = function(arg) {
        return void 0 === arg ? m_parent : (m_parent = arg, m_this);
    }, this.addChild = function(child) {
        return Array.isArray(child) ? (child.forEach(m_this.addChild), m_this) : (child.parent(m_this), 
        m_children.push(child), m_this);
    }, this.removeChild = function(child) {
        return Array.isArray(child) ? (child.forEach(m_this.removeChild), m_this) : (m_children = m_children.filter(function(c) {
            return c !== child;
        }), m_this);
    }, this.children = function() {
        return m_children.slice();
    }, this.draw = function(arg) {
        return m_this.children().forEach(function(child) {
            child.draw(arg);
        }), m_this;
    }, this.geoTrigger = function(event, args, childrenOnly) {
        var geoArgs;
        return args = args || {}, geoArgs = args.geo || {}, args.geo = geoArgs, geoArgs.stopPropagation ? m_this : !childrenOnly && m_parent && geoArgs._triggeredBy !== m_parent ? (geoArgs._triggeredBy = m_this, 
        m_parent.geoTrigger(event, args), m_this) : (s_trigger.call(m_this, event, args), 
        geoArgs.stopPropagation ? m_this : (m_children.forEach(function(child) {
            geoArgs._triggeredBy = m_this, child.geoTrigger(event, args);
        }), m_this));
    }, this;
}, inherit(geo.sceneObject, geo.object), geo.timestamp = function() {
    "use strict";
    return this instanceof geo.timestamp ? void vgl.timestamp.call(this) : new geo.timestamp();
}, inherit(geo.timestamp, vgl.timestamp), geo.ellipsoid = function(x, y, z) {
    "use strict";
    if (!(this instanceof geo.ellipsoid)) return new geo.ellipsoid(x, y, z);
    if (x = vgl.defaultValue(x, 0), y = vgl.defaultValue(y, 0), z = vgl.defaultValue(z, 0), 
    0 > x || 0 > y || 0 > z) return console.log("[error] Al radii components must be greater than zero");
    var m_this = this, m_radii = new vec3.fromValues(x, y, z), m_radiiSquared = new vec3.fromValues(x * x, y * y, z * z), m_minimumRadius = Math.min(x, y, z), m_maximumRadius = Math.max(x, y, z);
    return this.radii = function() {
        return m_radii;
    }, this.radiiSquared = function() {
        return m_radiiSquared;
    }, this.maximumRadius = function() {
        return m_maximumRadius;
    }, this.minimumRadius = function() {
        return m_minimumRadius;
    }, this.computeGeodeticSurfaceNormal = function(lat, lon) {
        if ("undefined" == typeof lat || "undefined" == typeof lon) throw "[error] Valid latitude and longitude is required";
        var cosLatitude = Math.cos(lat), result = vec3.create();
        return result[0] = cosLatitude * Math.cos(lon), result[1] = cosLatitude * Math.sin(lon), 
        result[2] = Math.sin(lat), vec3.normalize(result, result), result;
    }, this.transformPoint = function(lat, lon, elev) {
        lat *= Math.PI / 180, lon *= Math.PI / 180;
        var n = m_this.computeGeodeticSurfaceNormal(lat, lon), k = vec3.create(), gamma = Math.sqrt(vec3.dot(n, k)), result = vec3.create();
        return vec3.multiply(k, m_radiiSquared, n), vec3.scale(k, k, 1 / gamma), vec3.scale(n, n, elev), 
        vec3.add(result, n, k), result;
    }, this.transformGeometry = function(geom) {
        if (!geom) throw "[error] Failed to transform to cartesian. Invalid geometry.";
        var sourceData = geom.sourceData(vgl.vertexAttributeKeys.Position), sourceDataArray = sourceData.data(), noOfComponents = sourceData.attributeNumberOfComponents(vgl.vertexAttributeKeys.Position), stride = sourceData.attributeStride(vgl.vertexAttributeKeys.Position), offset = sourceData.attributeOffset(vgl.vertexAttributeKeys.Position), sizeOfDataType = sourceData.sizeOfAttributeDataType(vgl.vertexAttributeKeys.Position), index = null, count = sourceDataArray.length * (1 / noOfComponents), gamma = null, n = null, j = 0, k = vec3.create(), result = vec3.create();
        if (stride /= sizeOfDataType, offset /= sizeOfDataType, 3 !== noOfComponents) throw "[error] Requires positions with three components";
        for (j = 0; count > j; j += 1) index = j * stride + offset, sourceDataArray[index] = sourceDataArray[index] * (Math.PI / 180), 
        sourceDataArray[index + 1] = sourceDataArray[index + 1] * (Math.PI / 180), n = m_this.computeGeodeticSurfaceNormal(sourceDataArray[index + 1], sourceDataArray[index]), 
        vec3.multiply(k, m_radiiSquared, n), gamma = Math.sqrt(vec3.dot(n, k)), vec3.scale(k, k, 1 / gamma), 
        vec3.scale(n, n, sourceDataArray[index + 2]), vec3.add(result, n, k), sourceDataArray[index] = result[0], 
        sourceDataArray[index + 1] = result[1], sourceDataArray[index + 2] = result[2];
    }, m_this;
}, geo.ellipsoid.WGS84 = vgl.freezeObject(geo.ellipsoid(6378137, 6378137, 6356752.314245179)), 
geo.ellipsoid.UNIT_SPHERE = vgl.freezeObject(geo.ellipsoid(1, 1, 1)), geo.mercator = {
    r_major: 6378137
}, geo.mercator.r_minor = function(spherical) {
    "use strict";
    var r_minor;
    return spherical = void 0 !== spherical ? spherical : !1, r_minor = spherical ? 6378137 : 6356752.314245179;
}, geo.mercator.f = function(spherical) {
    "use strict";
    return (geo.mercator.r_major - geo.mercator.r_minor(spherical)) / geo.mercator.r_major;
}, geo.mercator.long2tilex = function(lon, z) {
    "use strict";
    var rad = (lon + 180) / 360, f = Math.floor(rad * Math.pow(2, z));
    return f;
}, geo.mercator.lat2tiley = function(lat, z) {
    "use strict";
    var rad = lat * Math.PI / 180;
    return Math.floor((1 - rad / Math.PI) / 2 * Math.pow(2, z));
}, geo.mercator.long2tilex2 = function(lon, z) {
    "use strict";
    var rad = (lon + 180) / 360, f = rad * Math.pow(2, z), ret = Math.floor(f), frac = f - ret;
    return [ ret, frac ];
}, geo.mercator.lat2tiley2 = function(lat, z) {
    "use strict";
    var rad = lat * Math.PI / 180, f = (1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2 * Math.pow(2, z), ret = Math.floor(f), frac = f - ret;
    return [ ret, frac ];
}, geo.mercator.tilex2long = function(x, z) {
    "use strict";
    return x / Math.pow(2, z) * 360 - 180;
}, geo.mercator.tiley2lat = function(y, z) {
    "use strict";
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return 180 / Math.PI * Math.atan(.5 * (Math.exp(n) - Math.exp(-n)));
}, geo.mercator.y2lat = function(a) {
    "use strict";
    return 180 / Math.PI * (2 * Math.atan(Math.exp(a * Math.PI / 180)) - Math.PI / 2);
}, geo.mercator.lat2y = function(a) {
    "use strict";
    return 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + a * (Math.PI / 180) / 2));
}, geo.mercator.deg2rad = function(d) {
    "use strict";
    var r = d * (Math.PI / 180);
    return r;
}, geo.mercator.rad2deg = function(r) {
    "use strict";
    var d = r / (Math.PI / 180);
    return d;
}, geo.mercator.ll2m = function(lon, lat, spherical) {
    "use strict";
    lat > 89.5 && (lat = 89.5), -89.5 > lat && (lat = -89.5);
    var x = this.r_major * this.deg2rad(lon), temp = this.r_minor(spherical) / this.r_major, es = 1 - temp * temp, eccent = Math.sqrt(es), phi = this.deg2rad(lat), sinphi = Math.sin(phi), con = eccent * sinphi, com = .5 * eccent, con2 = Math.pow((1 - con) / (1 + con), com), ts = Math.tan(.5 * (.5 * Math.PI - phi)) / con2, y = -this.r_major * Math.log(ts), ret = {
        x: x,
        y: y
    };
    return ret;
}, geo.mercator.m2ll = function(x, y, spherical) {
    "use strict";
    var lon = this.rad2deg(x / this.r_major), temp = this.r_minor(spherical) / this.r_major, e = Math.sqrt(1 - temp * temp), lat = this.rad2deg(this.pjPhi2(Math.exp(-(y / this.r_major)), e)), ret = {
        lon: lon,
        lat: lat
    };
    return ret;
}, geo.mercator.pjPhi2 = function(ts, e) {
    "use strict";
    var con, dphi, N_ITER = 15, HALFPI = Math.PI / 2, TOL = 1e-10, i = N_ITER, eccnth = .5 * e, Phi = HALFPI - 2 * Math.atan(ts);
    do con = e * Math.sin(Phi), dphi = HALFPI - 2 * Math.atan(ts * Math.pow((1 - con) / (1 + con), eccnth)) - Phi, 
    Phi += dphi, i -= 1; while (Math.abs(dphi) > TOL && i);
    return Phi;
}, geo.latlng = function(arg1, arg2, arg3) {
    "use strict";
    if (!(this instanceof geo.latlng)) return new geo.latlng(arg1, arg2, arg3);
    var m_this = this, m_lat = void 0 === arg2 && void 0 === arg3 ? arg1.lat() : arg1, m_lng = void 0 === arg2 && void 0 === arg3 ? arg1.lng() : arg2, m_elv = void 0 === arg2 && void 0 === arg3 ? arg1.elv() : arg3;
    return this.lat = function(val) {
        return void 0 === val ? m_lat : void (m_lat = val);
    }, this.lng = function(val) {
        return void 0 === val ? m_lng : void (m_lng = val);
    }, this.elv = function(val) {
        return void 0 === val ? m_elv : void (m_elv = val);
    }, this.x = function(val) {
        return void 0 === val ? m_this.lng() : void (m_lng = val);
    }, this.y = function(val) {
        return void 0 === val ? m_this.lat() : void (m_lat = val);
    }, this.z = function(val) {
        return void 0 === val ? m_this.elv() : void (m_elv = val);
    }, this;
}, geo.layerOptions = function() {
    "use strict";
    return this instanceof geo.layerOptions ? (this.opacity = .5, this.showAttribution = !0, 
    this.visible = !0, this.binNumber = vgl.material.RenderBin.Default, this) : new geo.layerOptions();
}, geo.newLayerId = function() {
    "use strict";
    var currentId = 1;
    return function() {
        var id = currentId;
        return currentId += 1, id;
    };
}(), geo.layer = function(arg) {
    "use strict";
    if (!(this instanceof geo.layer)) return new geo.layer(arg);
    arg = arg || {}, geo.sceneObject.call(this, arg);
    var m_this = this, m_style = void 0 === arg.style ? {
        opacity: .5,
        color: [ .8, .8, .8 ],
        visible: !0,
        bin: 100
    } : arg.style, m_id = void 0 === arg.id ? geo.newLayerId() : arg.id, m_name = "", m_gcs = "EPSG:4326", m_timeRange = null, m_source = arg.source || null, m_map = void 0 === arg.map ? null : arg.map, m_isReference = !1, m_x = 0, m_y = 0, m_width = 0, m_height = 0, m_node = null, m_canvas = null, m_renderer = null, m_initialized = !1, m_rendererName = void 0 === arg.renderer ? "vglRenderer" : arg.renderer, m_dataTime = geo.timestamp(), m_updateTime = geo.timestamp(), m_drawTime = geo.timestamp(), m_sticky = void 0 === arg.sticky ? !0 : arg.sticky;
    return this.sticky = function() {
        return m_sticky;
    }, this.node = function() {
        return m_node;
    }, this.id = function(val) {
        return void 0 === val ? m_id : (m_id = geo.newLayerId(), m_this.modified(), m_this);
    }, this.name = function(val) {
        return void 0 === val ? m_name : (m_name = val, m_this.modified(), m_this);
    }, this.opacity = function(val) {
        return void 0 === val ? m_style.opacity : (m_style.opacity = val, m_this.modified(), 
        m_this);
    }, this.visible = function(val) {
        return void 0 === val ? m_style.visible : (m_style.visible = val, m_this.modified(), 
        m_this);
    }, this.bin = function(val) {
        return void 0 === val ? m_style.bin : (m_style.bin = val, m_this.modified(), m_this);
    }, this.gcs = function(val) {
        return void 0 === val ? m_gcs : (m_gcs = val, m_this.modified(), m_this);
    }, this.transform = function(val) {
        return geo.transform.transformLayer(val, m_this, m_map.baseLayer()), m_this;
    }, this.timeRange = function(val) {
        return void 0 === val ? m_timeRange : (m_timeRange = val, m_this.modified(), m_this);
    }, this.source = function(val) {
        return void 0 === val ? m_source : (m_source = val, m_this.modified(), m_this);
    }, this.map = function(val) {
        return void 0 === val ? m_map : (m_map = val, m_map.node().append(m_node), m_this.modified(), 
        m_this);
    }, this.renderer = function() {
        return m_renderer;
    }, this.canvas = function() {
        return m_canvas;
    }, this.viewport = function() {
        return [ m_x, m_y, m_width, m_height ];
    }, this.dataTime = function() {
        return m_dataTime;
    }, this.updateTime = function() {
        return m_updateTime;
    }, this.drawTime = function() {
        return m_drawTime;
    }, this.query = function() {}, this.referenceLayer = function(val) {
        return void 0 !== val ? (m_isReference = val, m_this.modified(), m_this) : m_isReference;
    }, this.initialized = function(val) {
        return void 0 !== val ? (m_initialized = val, m_this) : m_initialized;
    }, this.toLocal = function(input) {
        return input;
    }, this.fromLocal = function(input) {
        return input;
    }, this._init = function() {
        return m_initialized ? m_this : (m_node = $(document.createElement("div")), m_node.attr("id", m_name), 
        m_node.css("position", "absolute"), m_map && m_map.node().append(m_node), m_canvas ? m_renderer = geo.createRenderer(m_rendererName, m_this, m_canvas) : (m_renderer = geo.createRenderer(m_rendererName, m_this), 
        m_canvas = m_renderer.canvas()), m_initialized = !0, m_this);
    }, this._exit = function() {}, this._update = function() {}, this._resize = function(x, y, w, h) {
        return m_x = x, m_y = y, m_width = w, m_height = h, m_node.width(w), m_node.height(h), 
        m_this.modified(), m_this.geoTrigger(geo.event.resize, {
            x: x,
            y: y,
            width: m_width,
            height: m_height
        }), m_this;
    }, this.width = function() {
        return m_width;
    }, this.height = function() {
        return m_height;
    }, this;
}, inherit(geo.layer, geo.sceneObject), geo.featureLayer = function(arg) {
    "use strict";
    if (!(this instanceof geo.featureLayer)) return new geo.featureLayer(arg);
    geo.layer.call(this, arg);
    var m_this = this, m_features = [], s_init = this._init, s_update = this._update, s_draw = this.draw;
    return this.createFeature = function(featureName, arg) {
        var newFeature = geo.createFeature(featureName, m_this, m_this.renderer(), arg);
        return m_this.addChild(newFeature), m_features.push(newFeature), m_this.features(m_features), 
        m_this.modified(), newFeature;
    }, this.deleteFeature = function(feature) {
        var i;
        for (i = 0; i < m_features.length; i += 1) if (m_features[i] === feature) return m_features[i]._exit(), 
        m_this.dataTime().modified(), m_this.modified(), m_features.splice(i, 1), m_this;
        return m_this.removeChild(feature), m_this;
    }, this.features = function(val) {
        return void 0 === val ? m_features : (m_features = val.slice(0), m_this.dataTime().modified(), 
        m_this.modified(), m_this);
    }, this._init = function() {
        return m_this.initialized() ? m_this : (s_init.call(m_this), m_this.geoOn(geo.event.resize, function(event) {
            m_this.renderer()._resize(event.x, event.y, event.width, event.height), m_this._update({}), 
            m_this.renderer()._render();
        }), m_this.geoOn(geo.event.pan, function(event) {
            m_this._update({
                event: event
            }), m_this.renderer()._render();
        }), m_this.geoOn(geo.event.zoom, function(event) {
            m_this._update({
                event: event
            }), m_this.renderer()._render();
        }), m_this);
    }, this._update = function(request) {
        var i;
        if (!m_features.length) return m_this;
        if (s_update.call(m_this, request), !m_this.source() && m_features && 0 === m_features.length) return void console.log("[info] No valid data source found.");
        if (m_this.dataTime().getMTime() > m_this.updateTime().getMTime()) for (i = 0; i < m_features.length; i += 1) m_features[i].renderer(m_this.renderer());
        for (i = 0; i < m_features.length; i += 1) m_features[i]._update();
        return m_this.updateTime().modified(), m_this;
    }, this.draw = function() {
        return s_draw(), m_this.renderer()._render(), m_this;
    }, this.clear = function() {
        var i;
        if (!m_features.length) return m_this;
        for (i = 0; i < m_features.length; i += 1) m_features[i]._exit();
        return m_this.dataTime().modified(), m_this.modified(), m_features = [], m_this;
    }, m_this;
}, inherit(geo.featureLayer, geo.layer), geo.registerLayer("feature", geo.featureLayer), 
geo.event = function() {
    "use strict";
    return this instanceof geo.event ? (vgl.event.call(this), this) : new geo.event();
}, inherit(geo.event, vgl.event), geo.event.update = "geo_update", geo.event.opacityUpdate = "geo_opacityUpdate", 
geo.event.layerAdd = "geo_layerAdd", geo.event.layerRemove = "geo_layerRemove", 
geo.event.layerToggle = "geo_layerToggle", geo.event.layerSelect = "geo_layerSelect", 
geo.event.layerUnselect = "geo_layerUnselect", geo.event.zoom = "geo_zoom", geo.event.pan = "geo_pan", 
geo.event.rotate = "geo_rotate", geo.event.resize = "geo_resize", geo.event.animate = "geo_animate", 
geo.event.query = "geo_query", geo.event.draw = "geo_draw", geo.event.drawEnd = "geo_drawEnd", 
geo.event.animationPause = "geo_animationPause", geo.event.animationStop = "geo_animationStop", 
geo.event.animationComplete = "geo_animationComplete", geo.event.mousemove = "geo_mousemove", 
geo.event.mouseclick = "geo_mouseclick", geo.event.brush = "geo_brush", geo.event.brushend = "geo_brushend", 
geo.event.brushstart = "geo_brushstart", geo.mapInteractor = function(args) {
    "use strict";
    function eventMatch(button, modifiers) {
        return ("wheel" === button || m_mouse.buttons[button]) && !!m_mouse.modifiers.alt == !!modifiers.alt && !!m_mouse.modifiers.meta == !!modifiers.meta && !!m_mouse.modifiers.shift == !!modifiers.shift && !!m_mouse.modifiers.ctrl == !!modifiers.ctrl;
    }
    function calcSpeed(v) {
        var x = v.x, y = v.y;
        return Math.sqrt(x * x + y * y);
    }
    function doRespond() {
        return m_disableThrottle ? !0 : m_wait ? !1 : (m_wait = !0, window.setTimeout(function() {
            m_wait = !1, m_wheelQueue = {
                x: 0,
                y: 0
            };
        }, m_throttleTime), !0);
    }
    if (!(this instanceof geo.mapInteractor)) return new geo.mapInteractor(args);
    geo.object.call(this);
    var m_mouse, m_keyboard, m_state, $node, m_options = args || {}, m_this = this, m_wheelQueue = {
        x: 0,
        y: 0
    }, m_throttleTime = 10, m_wait = !1, m_disableThrottle = !0;
    return m_options = $.extend(!0, {
        panMoveButton: "left",
        panMoveModifiers: {},
        zoomMoveButton: "right",
        zoomMoveModifiers: {},
        panWheelEnabled: !1,
        panWheelModifiers: {},
        zoomWheelEnabled: !0,
        zoomWheelModifiers: {},
        wheelScaleX: 1,
        wheelScaleY: 1,
        zoomScale: 1,
        selectionButton: "left",
        selectionModifiers: {
            shift: !0
        },
        momentum: {
            enabled: !0,
            maxSpeed: 10,
            minSpeed: .01,
            drag: .005
        }
    }, m_options), m_mouse = {
        page: {
            x: 0,
            y: 0
        },
        map: {
            x: 0,
            y: 0
        },
        buttons: {
            left: !1,
            right: !1,
            middle: !1
        },
        modifiers: {
            alt: !1,
            ctrl: !1,
            shift: !1,
            meta: !1
        },
        time: new Date(),
        deltaTime: 1,
        velocity: 0
    }, m_keyboard = {}, m_state = {}, this._connectEvents = function() {
        return m_options.map ? (m_this._disconnectEvents(), $node = $(m_options.map.node()), 
        $node.on("mousemove.geojs", m_this._handleMouseMove), $node.on("mousedown.geojs", m_this._handleMouseDown), 
        $node.on("mouseup.geojs", m_this._handleMouseUp), $node.on("mousewheel.geojs", m_this._handleMouseWheel), 
        ("right" === m_options.panMoveButton || "right" === m_options.zoomMoveButton) && $node.on("contextmenu.geojs", function() {
            return !1;
        }), m_this) : m_this;
    }, this._disconnectEvents = function() {
        return $node && ($node.off(".geojs"), $node = null), m_this;
    }, this.map = function(val) {
        return void 0 !== val ? (m_options.map = val, m_this._connectEvents(), m_this) : m_options.map;
    }, this.options = function(opts) {
        return void 0 === opts ? $.extend({}, m_options) : ($.extend(m_options, opts), m_this);
    }, this._getMousePosition = function(evt) {
        var dt, t, offset = $node.offset();
        t = new Date().valueOf(), dt = t - m_mouse.time, m_mouse.time = t, m_mouse.deltaTime = dt, 
        m_mouse.velocity = {
            x: (evt.pageX - m_mouse.page.x) / dt,
            y: (evt.pageY - m_mouse.page.y) / dt
        }, m_mouse.page = {
            x: evt.pageX,
            y: evt.pageY
        }, m_mouse.map = {
            x: evt.pageX - offset.left,
            y: evt.pageY - offset.top
        }, m_mouse.geo = m_this.map().displayToGcs(m_mouse.map);
    }, this._getMouseButton = function(evt) {
        1 === evt.which ? m_mouse.buttons.left = "mouseup" !== evt.type : 3 === evt.which ? m_mouse.buttons.right = "mouseup" !== evt.type : 2 === evt.which && (m_mouse.buttons.middle = "mouseup" !== evt.type);
    }, this._getMouseModifiers = function(evt) {
        m_mouse.modifiers.alt = evt.altKey, m_mouse.modifiers.ctrl = evt.ctrlKey, m_mouse.modifiers.meta = evt.metaKey, 
        m_mouse.modifiers.shift = evt.shiftKey;
    }, this._getSelection = function() {
        var origin = m_state.origin, mouse = m_this.mouse(), map = m_this.map(), display = {}, gcs = {};
        return display.upperLeft = {
            x: Math.min(origin.map.x, mouse.map.x),
            y: Math.min(origin.map.y, mouse.map.y)
        }, display.lowerRight = {
            x: Math.max(origin.map.x, mouse.map.x),
            y: Math.max(origin.map.y, mouse.map.y)
        }, display.upperRight = {
            x: display.lowerRight.x,
            y: display.upperLeft.y
        }, display.lowerLeft = {
            x: display.upperLeft.x,
            y: display.lowerRight.y
        }, gcs.upperLeft = map.displayToGcs(display.upperLeft), gcs.lowerRight = map.displayToGcs(display.lowerRight), 
        gcs.upperRight = map.displayToGcs(display.upperRight), gcs.lowerLeft = map.displayToGcs(display.lowerLeft), 
        {
            display: display,
            gcs: gcs,
            mouse: mouse,
            origin: $.extend({}, m_state.origin)
        };
    }, this._handleMouseDown = function(evt) {
        var action = null;
        "momentum" === m_state.action && (m_state = {}), m_this._getMousePosition(evt), 
        m_this._getMouseButton(evt), m_this._getMouseModifiers(evt), eventMatch(m_options.panMoveButton, m_options.panMoveModifiers) ? action = "pan" : eventMatch(m_options.zoomMoveButton, m_options.zoomMoveModifiers) ? action = "zoom" : eventMatch(m_options.selectionButton, m_options.selectionModifiers) && (action = "select"), 
        action && (m_state = {
            action: action,
            origin: $.extend(!0, {}, m_mouse),
            delta: {
                x: 0,
                y: 0
            }
        }, "select" === action && m_this.map().geoTrigger(geo.event.brushstart, m_this._getSelection()), 
        $(document).on("mousemove.geojs", m_this._handleMouseMoveDocument), $(document).on("mouseup.geojs", m_this._handleMouseUpDocument));
    }, this._handleMouseMove = function(evt) {
        m_state.action || (m_this._getMousePosition(evt), m_this._getMouseButton(evt), m_this._getMouseModifiers(evt), 
        m_this.map().geoTrigger(geo.event.mousemove, m_this.mouse()));
    }, this._handleMouseMoveDocument = function(evt) {
        var dx, dy, selectionObj;
        return m_this._getMousePosition(evt), m_this._getMouseButton(evt), m_this._getMouseModifiers(evt), 
        m_state.action ? void (doRespond() && (dx = m_mouse.map.x - m_state.origin.map.x - m_state.delta.x, 
        dy = m_mouse.map.y - m_state.origin.map.y - m_state.delta.y, m_state.delta.x += dx, 
        m_state.delta.y += dy, "pan" === m_state.action ? m_this.map().pan({
            x: dx,
            y: dy
        }) : "zoom" === m_state.action ? m_this.map().zoom(m_this.map().zoom() - dy * m_options.zoomScale / 120) : "select" === m_state.action && (selectionObj = m_this._getSelection(), 
        m_this.map().geoTrigger(geo.event.brush, selectionObj)), evt.preventDefault())) : void console.log("WARNING: Invalid state in mapInteractor.");
    }, this._handleMouseUpDocument = function(evt) {
        var selectionObj, oldAction;
        m_this._getMouseButton(evt), m_this._getMouseModifiers(evt), $(document).off(".geojs"), 
        m_mouse.buttons.right && evt.preventDefault(), "select" === m_state.action && (selectionObj = m_this._getSelection(), 
        m_this.map().geoTrigger(geo.event.brushend, selectionObj)), oldAction = m_state.action, 
        m_state = {}, m_options.momentum.enabled && "pan" === oldAction && (m_state.action = "momentum", 
        m_state.origin = m_this.mouse(), m_state.handler = function() {
            var vx, vy, speed, s;
            if ("momentum" === m_state.action && m_this.map()) {
                if (vx = m_mouse.velocity.x, vy = m_mouse.velocity.y, speed = calcSpeed(m_mouse.velocity), 
                s = speed, vx /= speed, vy /= speed, speed = Math.min(speed, m_options.momentum.maxSpeed), 
                speed *= Math.exp(-m_options.momentum.drag * m_mouse.deltaTime), speed < m_options.momentum.minSpeed) return void (m_state = {});
                m_mouse.velocity.x = speed * vx, m_mouse.velocity.y = speed * vy, m_this.map().pan({
                    x: m_mouse.velocity.x * m_mouse.deltaTime,
                    y: m_mouse.velocity.y * m_mouse.deltaTime
                }), window.requestAnimationFrame(m_state.handler);
            }
        }, window.requestAnimationFrame(m_state.handler));
    }, this._handleMouseUp = function(evt) {
        m_this._getMouseButton(evt), m_this._getMouseModifiers(evt), m_this.map().geoTrigger(geo.event.mouseclick, m_this.mouse());
    }, this._handleMouseWheel = function(evt) {
        var zoomFactor, direction;
        return evt.deltaFactor = evt.deltaFactor || 1, m_this._getMouseModifiers(evt), evt.deltaX = evt.deltaX * m_options.wheelScaleX * evt.deltaFactor / 120, 
        evt.deltaY = evt.deltaY * m_options.wheelScaleY * evt.deltaFactor / 120, evt.preventDefault(), 
        doRespond() ? (evt.deltaX += m_wheelQueue.x, evt.deltaY += m_wheelQueue.y, m_wheelQueue = {
            x: 0,
            y: 0
        }, void (m_options.panWheelEnabled && eventMatch("wheel", m_options.panWheelModifiers) ? m_this.map().pan({
            x: evt.deltaX,
            y: evt.deltaY
        }) : m_options.zoomWheelEnabled && eventMatch("wheel", m_options.zoomWheelModifiers) && (zoomFactor = evt.deltaY, 
        direction = m_mouse.map, m_this.map().zoom(m_this.map().zoom() + zoomFactor, direction)))) : (m_wheelQueue.x += evt.deltaX, 
        void (m_wheelQueue.y += evt.deltaY));
    }, this._handleDoubleClick = function() {}, this.destroy = function() {
        m_this._disconnectEvents(), m_this.map(null);
    }, this.mouse = function() {
        return $.extend(!0, {}, m_mouse);
    }, this.keyboard = function() {
        return $.extend(!0, {}, m_keyboard);
    }, this.state = function() {
        return $.extend(!0, {}, m_state);
    }, this.simulateEvent = function(type, options) {
        var evt, page, offset, which;
        return m_this.map() ? (page = options.page || {}, options.map && (offset = $node.offset(), 
        page.x = options.map.x + offset.left, page.y = options.map.y + offset.top), "left" === options.button ? which = 1 : "right" === options.button ? which = 3 : "middle" === options.button && (which = 2), 
        options.modifiers = options.modifiers || [], options.wheelDelta = options.wheelDelta || {}, 
        evt = $.Event(type, {
            pageX: page.x,
            pageY: page.y,
            which: which,
            altKey: options.modifiers.indexOf("alt") >= 0,
            ctrlKey: options.modifiers.indexOf("ctrl") >= 0,
            metaKey: options.modifiers.indexOf("meta") >= 0,
            shiftKey: options.modifiers.indexOf("shift") >= 0,
            deltaX: options.wheelDelta.x,
            deltaY: options.wheelDelta.y,
            deltaFactor: 1
        }), void $node.trigger(evt)) : m_this;
    }, this._connectEvents(), this;
}, inherit(geo.mapInteractor, geo.object), geo.time = {}, geo.time.incrementTime = function(time, unit, delta) {
    "use strict";
    return "days" === unit ? time.setDate(time.getDate() + delta) : "months" === unit ? time.setMonth(time.getMonth() + delta) : "years" === unit ? time.setYear(time.getYear() + delta) : "index" === unit && (time += delta), 
    time;
}, geo.fileReader = function(arg) {
    "use strict";
    function newFileReader(done, progress) {
        var reader = new FileReader();
        return progress && (reader.onprogress = progress), reader.onloadend = function() {
            reader.result || done(reader.error), done(reader.result);
        }, reader;
    }
    if (!(this instanceof geo.fileReader)) return new geo.fileReader(arg);
    if (geo.object.call(this), arg = arg || {}, !(arg.layer instanceof geo.featureLayer)) throw "fileReader must be given a feature layer";
    var m_layer = arg.layer;
    return this.layer = function() {
        return m_layer;
    }, this.canRead = function() {
        return !1;
    }, this.read = function(file, done) {
        done(!1);
    }, this._getString = function(file, done, progress) {
        var reader = newFileReader(done, progress);
        reader.readAsText(file);
    }, this._getArrayBuffer = function(file, done, progress) {
        var reader = newFileReader(done, progress);
        reader.readAsText(file);
    }, this;
}, inherit(geo.fileReader, geo.object), geo.jsonReader = function(arg) {
    "use strict";
    if (!(this instanceof geo.jsonReader)) return new geo.jsonReader(arg);
    var m_this = this, m_style = arg.style || {};
    geo.fileReader.call(this, arg), this.canRead = function(file) {
        if (file instanceof File) return "application/json" === file.type || file.name.match(/\.json$/);
        if ("string" == typeof file) {
            try {
                JSON.parse(file);
            } catch (e) {
                return !1;
            }
            return !0;
        }
        try {
            if (Array.isArray(m_this._featureArray(file))) return !0;
        } catch (e) {}
        return !1;
    }, this._readObject = function(file, done, progress) {
        function onDone(fileString) {
            "string" != typeof fileString && done(!1);
            try {
                object = JSON.parse(fileString), done(object);
            } catch (e) {
                object || $.ajax({
                    type: "GET",
                    url: fileString,
                    dataType: "text"
                }).done(function(data) {
                    object = JSON.parse(data), done(object);
                }).fail(function() {
                    done(!1);
                });
            }
        }
        var object;
        file instanceof File ? m_this._getString(file, onDone, progress) : "string" == typeof file ? onDone(file) : done(file);
    }, this._featureArray = function(spec) {
        if ("FeatureCollection" === spec.type) return spec.features || [];
        if ("GeometryCollection" === spec.type) throw "GeometryCollection not yet implemented.";
        if (Array.isArray(spec.coordinates)) return spec;
        throw "Unsupported collection type: " + spec.type;
    }, this._featureType = function(spec) {
        var geometry = spec.geometry || {};
        return "Point" === geometry.type || "MultiPoint" === geometry.type ? "point" : "LineString" === geometry.type ? "line" : null;
    }, this._getCoordinates = function(spec) {
        var elv, geometry = spec.geometry || {}, coordinates = geometry.coordinates || [];
        return (2 === coordinates.length || 3 === coordinates.length) && isFinite(coordinates[0]) && isFinite(coordinates[1]) ? (isFinite(coordinates[2]) && (elv = coordinates[2]), 
        [ geo.latlng(coordinates[1], coordinates[0], elv) ]) : coordinates.map(function(c) {
            return geo.latlng(c[1], c[0], c[2]);
        });
    }, this._getStyle = function() {
        return {};
    }, this.read = function(file, done, progress) {
        function _done(object) {
            var features, allFeatures = [];
            features = m_this._featureArray(object), features.forEach(function(feature) {
                var type = m_this._featureType(feature), coordinates = m_this._getCoordinates(feature), style = m_this._getStyle(feature);
                type ? allFeatures.push("line" === type ? m_this._addFeature(type, [ coordinates ], style) : m_this._addFeature(type, coordinates, style)) : console.log("unsupported feature type: " + feature.geometry.type);
            }), done && done(allFeatures);
        }
        m_this._readObject(file, _done, progress);
    }, this._addFeature = function(type, coordinates, style) {
        var _style = $.extend({}, m_style, style);
        return m_this.layer().createFeature(type).data(coordinates).position(function(d) {
            return {
                x: d.x(),
                y: d.y(),
                z: d.z() || 0
            };
        }).style(_style);
    };
}, inherit(geo.jsonReader, geo.fileReader), geo.registerFileReader("jsonReader", geo.jsonReader), 
geo.map = function(arg) {
    "use strict";
    if (!(this instanceof geo.map)) return new geo.map(arg);
    arg = arg || {}, geo.sceneObject.call(this, arg), arg.layers = void 0 === arg.layers ? [] : arg.layers;
    var toMillis, calculateGlobalAnimationRange, cloneTimestep, m_pause, m_stop, m_this = this, m_x = 0, m_y = 0, m_node = $(arg.node), m_width = arg.width || m_node.width(), m_height = arg.height || m_node.height(), m_gcs = void 0 === arg.gcs ? "EPSG:4326" : arg.gcs, m_uigcs = void 0 === arg.uigcs ? "EPSG:4326" : arg.uigcs, m_center = {
        x: 0,
        y: 0
    }, m_zoom = void 0 === arg.zoom ? 1 : arg.zoom, m_baseLayer = null, m_animationState = {
        range: null,
        timestep: null,
        layers: null
    }, m_intervalMap = {}, m_fileReader = null, m_interactor = null, m_validZoomRange = {
        min: 0,
        max: 16
    }, m_transition = null;
    return m_intervalMap.milliseconds = 1, m_intervalMap.seconds = 1e3 * m_intervalMap.milliseconds, 
    m_intervalMap.minutes = 60 * m_intervalMap.seconds, m_intervalMap.hours = 60 * m_intervalMap.minutes, 
    m_intervalMap.days = 24 * m_intervalMap.hours, m_intervalMap.weeks = 7 * m_intervalMap.days, 
    m_intervalMap.months = 4 * m_intervalMap.weeks, m_intervalMap.years = 12 * m_intervalMap.months, 
    this.geoOn(geo.event.animationPause, function() {
        m_pause = !0;
    }), this.geoOn(geo.event.animationStop, function() {
        m_stop = !0;
    }), arg.center && Array.isArray(arg.center) && (arg.center = {
        x: arg.center[1],
        y: arg.center[0]
    }), toMillis = function(delta) {
        var deltaLowercase = delta.toLowerCase();
        return m_intervalMap[deltaLowercase];
    }, calculateGlobalAnimationRange = function(layers) {
        var delta, deltaUnits, layerTimeRange, layerDelta, i, start = null, end = null, indexTimestep = !1, smallestDeltaInMillis = Number.MAX_VALUE;
        for (i = 0; i < layers.length; i += 1) if (layerTimeRange = layers[i].timeRange()) {
            if ("index" === layerTimeRange.deltaUnits) indexTimestep = !0, layerDelta = layerTimeRange.delta; else {
                if (indexTimestep) throw "Can't mix index timesteps with time based timesteps";
                layerDelta = toMillis(layerTimeRange.deltaUnits) * layerTimeRange.delta;
            }
            smallestDeltaInMillis > layerDelta && (delta = layerTimeRange.delta, deltaUnits = layerTimeRange.deltaUnits, 
            smallestDeltaInMillis = layerDelta), (null === start || layerTimeRange.start < start) && (start = layerTimeRange.start), 
            (null === end || layerTimeRange.end < end) && (end = layerTimeRange.end);
        }
        return {
            start: start,
            end: end,
            delta: delta,
            deltaUnits: deltaUnits
        };
    }, cloneTimestep = function(timestep) {
        return timestep instanceof Date && (timestep = new Date(timestep.getTime())), timestep;
    }, this.gcs = function(arg) {
        return void 0 === arg ? m_gcs : (m_gcs = arg, m_this);
    }, this.uigcs = function() {
        return m_uigcs;
    }, this.node = function() {
        return m_node;
    }, this.zoom = function(val, direction) {
        var base, evt;
        return void 0 === val ? m_zoom : val === m_zoom || val > m_validZoomRange.max || val < m_validZoomRange.min ? m_this : (base = m_this.baseLayer(), 
        evt = {
            geo: {},
            zoomLevel: val,
            screenPosition: direction,
            eventType: geo.event.zoom
        }, base && base.renderer().geoTrigger(geo.event.zoom, evt, !0), evt.geo.preventDefault ? void 0 : (m_zoom = val, 
        m_this.children().forEach(function(child) {
            child.geoTrigger(geo.event.zoom, evt, !0);
        }), m_this));
    }, this.pan = function(delta) {
        var evt, base = m_this.baseLayer();
        return evt = {
            geo: {},
            screenDelta: delta,
            eventType: geo.event.pan
        }, base && base.renderer().geoTrigger(geo.event.pan, evt, !0), evt.geo.preventDefault ? void 0 : (m_center = m_this.displayToGcs({
            x: m_width / 2,
            y: m_height / 2
        }), m_this.children().forEach(function(child) {
            child.geoTrigger(geo.event.pan, evt, !0);
        }), m_this.modified(), m_this);
    }, this.center = function(coordinates) {
        var newCenter, currentCenter;
        return void 0 === coordinates ? m_center : (newCenter = m_this.gcsToDisplay(coordinates), 
        currentCenter = m_this.gcsToDisplay(m_center), m_this.pan({
            x: currentCenter.x - newCenter.x,
            y: currentCenter.y - newCenter.y
        }), m_this);
    }, this.createLayer = function(layerName, arg) {
        var newLayer = geo.createLayer(layerName, m_this, arg);
        return null === newLayer && void 0 === newLayer ? null : (newLayer._resize(m_x, m_y, m_width, m_height), 
        (newLayer.referenceLayer() || 0 === m_this.children().length) && m_this.baseLayer(newLayer), 
        m_this.addChild(newLayer), m_this.modified(), newLayer.referenceLayer() || m_this.center(m_this.center()), 
        m_this.geoTrigger(geo.event.layerAdd, {
            type: geo.event.layerAdd,
            target: m_this,
            layer: newLayer
        }), newLayer);
    }, this.deleteLayer = function(layer) {
        return null !== layer && void 0 !== layer && (layer._exit(), m_this.removeChild(layer), 
        m_this.modified(), m_this.geoTrigger(geo.event.layerRemove, {
            type: geo.event.layerRemove,
            target: m_this,
            layer: layer
        })), layer;
    }, this.toggle = function(layer) {
        return null !== layer && void 0 !== layer && (layer.visible(!layer.visible()), m_this.modified(), 
        m_this.geoTrigger(geo.event.layerToggle, {
            type: geo.event.layerToggle,
            target: m_this,
            layer: layer
        })), m_this;
    }, this.resize = function(x, y, w, h) {
        var i, layers = m_this.children();
        for (m_x = x, m_y = y, m_width = w, m_height = h, i = 0; i < layers.length; i += 1) layers[i]._resize(x, y, w, h);
        return m_this.geoTrigger(geo.event.resize, {
            type: geo.event.resize,
            target: m_this,
            x: m_x,
            y: m_y,
            width: w,
            height: h
        }), m_this.modified(), m_this;
    }, this.gcsToDisplay = function(input) {
        var world, output;
        if (!(input instanceof Array && input.length > 0 || input instanceof Object)) throw "Conversion method latLonToDisplay does not handle " + input;
        return world = m_baseLayer.toLocal(input), output = m_baseLayer.renderer().worldToDisplay(world);
    }, this.displayToGcs = function(input) {
        var output;
        if (!(input instanceof Array && input.length > 0 || input instanceof Object)) throw "Conversion method latLonToDisplay does not handle " + input;
        return output = m_baseLayer.renderer().displayToWorld(input), output = m_baseLayer.fromLocal(output);
    }, this.query = function() {}, this.baseLayer = function(baseLayer) {
        return void 0 !== baseLayer ? (m_gcs !== baseLayer.gcs() && m_this.gcs(baseLayer.gcs()), 
        m_baseLayer = baseLayer, m_baseLayer.referenceLayer(!0), arg.center && m_this.center(arg.center), 
        void 0 !== arg.zoom && (m_zoom = null, m_this.zoom(arg.zoom)), m_this) : m_baseLayer;
    }, this.draw = function() {
        var i, layers = m_this.children();
        for (m_this.geoTrigger(geo.event.draw, {
            type: geo.event.draw,
            target: m_this
        }), m_this._update(), i = 0; i < layers.length; i += 1) layers[i].draw();
        return m_this.geoTrigger(geo.event.drawEnd, {
            type: geo.event.drawEnd,
            target: m_this
        }), m_this;
    }, this.animate = function(layers) {
        var animationRange;
        if (layers = void 0 === layers ? m_this.children() : layers, null === m_animationState.timestep) {
            if (animationRange = calculateGlobalAnimationRange(layers), !animationRange.start || !animationRange.end) throw "Animation range could not be calculated. Check that layers have ranges associated with them";
            m_animationState = {
                range: animationRange,
                timestep: cloneTimestep(animationRange.start),
                layers: layers
            };
        }
        return m_this._animate(), m_this;
    }, this.pauseAnimation = function() {
        return m_this.geoTrigger(geo.event.animationPause), m_this;
    }, this.stopAnimation = function() {
        return m_this.geoTrigger(geo.event.animationStop), m_animationState.timestep = null, 
        m_this;
    }, this.stepAnimationForward = function(layers) {
        var animationRange;
        return layers = void 0 === layers ? m_animationState.layers : layers, null === layers && (layers = m_this.children()), 
        null === m_animationState.timestep && (animationRange = calculateGlobalAnimationRange(layers), 
        m_animationState = {
            range: animationRange,
            timestep: cloneTimestep(animationRange.start),
            layers: layers
        }), m_this._stepAnimationForward(), m_this;
    }, this.stepAnimationBackward = function(layers) {
        var animationRange;
        return layers = void 0 === layers ? m_animationState.layers : layers, null === layers && (layers = m_this.children()), 
        null === m_animationState.timestep && (animationRange = calculateGlobalAnimationRange(layers), 
        m_animationState = {
            range: animationRange,
            timestep: cloneTimestep(animationRange.end),
            layers: layers
        }), m_this._stepAnimationBackward(), m_this;
    }, this._animate = function() {
        function renderTimestep() {
            m_animationState.timestep > animationRange.end || m_stop ? (clearInterval(id), m_animationState.timestep = null, 
            m_this.geoTrigger(geo.event.animationComplete)) : m_pause ? clearInterval(id) : (m_this._animateTimestep(), 
            m_animationState.timestep = geo.time.incrementTime(m_animationState.timestep, m_animationState.range.deltaUnits, m_animationState.range.delta));
        }
        var animationRange, nextTimestep, id;
        if (animationRange = m_animationState.range, nextTimestep = cloneTimestep(animationRange.start), 
        m_stop = !1, m_pause = !1, nextTimestep = geo.time.incrementTime(nextTimestep, animationRange.deltaUnits, animationRange.delta), 
        nextTimestep > animationRange.end) throw "Invalid time range";
        return id = setInterval(renderTimestep, 10), m_this;
    }, this._animateTimestep = function() {
        return m_animationState && ($.each(m_animationState.layers, function(i, layer) {
            var timestep = m_animationState.timestep;
            timestep instanceof Date && (timestep = timestep.getTime()), layer._update({
                timestep: timestep
            });
        }), m_this.geoTrigger(geo.event.animate, {
            timestep: m_animationState.timestep
        }), m_this.draw()), m_this;
    }, this._stepAnimationForward = function() {
        var nextTimestep;
        return null === m_animationState.timestep && (m_animationState.timestep = cloneTimestep(m_animationState.range.start)), 
        nextTimestep = cloneTimestep(m_animationState.timestep), nextTimestep = geo.time.incrementTime(nextTimestep, m_animationState.range.deltaUnits, m_animationState.range.delta), 
        nextTimestep <= m_animationState.range.end && (m_animationState.timestep = nextTimestep, 
        m_this._animateTimestep()), m_this;
    }, this._stepAnimationBackward = function() {
        var previousTimestep;
        return null === m_animationState.timestep && (m_animationState.timestep = cloneTimestep(m_animationState.range.end)), 
        previousTimestep = cloneTimestep(m_animationState.timestep), previousTimestep = geo.time.incrementTime(previousTimestep, m_animationState.range.deltaUnits, -m_animationState.range.delta), 
        previousTimestep < m_animationState.range.start ? void 0 : (m_animationState.timestep = previousTimestep, 
        m_this._animateTimestep(), m_this);
    }, this.fileReader = function(readerType, opts) {
        var layer, renderer;
        return opts = opts || {}, readerType ? (layer = opts.layer, layer || (renderer = opts.renderer, 
        renderer || (renderer = "d3Renderer"), layer = m_this.createLayer("feature", {
            renderer: renderer
        })), opts.layer = layer, opts.renderer = renderer, m_fileReader = geo.createFileReader(readerType, opts), 
        m_this) : m_fileReader;
    }, this._init = function(arg) {
        var i;
        if (void 0 === m_node || null === m_node) throw "Map require DIV node";
        if (void 0 !== arg && void 0 !== arg.layers) for (i = 0; i < arg.layers.length; i += 1) 0 === i && m_this.baseLayer(arg.layers[i]), 
        m_this.addLayer(arg.layers[i]);
        return m_this;
    }, this._update = function(request) {
        var i, layers = m_this.children();
        for (i = 0; i < layers.length; i += 1) layers[i]._update(request);
        return m_this;
    }, this._exit = function() {
        var i, layers = m_this.children();
        for (i = 0; i < layers.length; i += 1) layers[i]._exit();
        m_this.interactor() && (m_this.interactor().destroy(), m_this.interactor(null));
    }, this._init(arg), this.node().on("dragover", function(e) {
        var evt = e.originalEvent;
        m_this.fileReader() && (evt.stopPropagation(), evt.preventDefault(), evt.dataTransfer.dropEffect = "copy");
    }).on("drop", function(e) {
        function done() {
            m_this.draw();
        }
        var i, file, evt = e.originalEvent, reader = m_this.fileReader();
        if (reader) for (evt.stopPropagation(), evt.preventDefault(), i = 0; i < evt.dataTransfer.files.length; i += 1) file = evt.dataTransfer.files[i], 
        reader.canRead(file) && reader.read(file, done);
    }), this.interactor = function(arg) {
        return void 0 === arg ? m_interactor : (m_interactor = arg, m_interactor && m_interactor.map(m_this), 
        m_this);
    }, this.zoomRange = function(arg) {
        return void 0 === arg ? $.extend({}, m_validZoomRange) : (m_validZoomRange.min = arg.min, 
        m_validZoomRange.max = arg.max, m_this);
    }, this.transition = function(opts) {
        function anim(time) {
            if (m_transition.start.time || (m_transition.start.time = time, m_transition.end.time = time + defaultOpts.duration), 
            time >= m_transition.end.time) return m_this.center(m_transition.end.center), m_this.zoom(m_transition.end.zoom), 
            void (m_transition = null);
            var z = m_transition.ease((time - m_transition.start.time) / defaultOpts.duration);
            m_this.center({
                x: m_transition.start.center.x + z * deltaCenterX,
                y: m_transition.start.center.y + z * deltaCenterY
            }), m_this.zoom(m_transition.start.zoom + z * deltaZoom), window.requestAnimationFrame(anim);
        }
        if (m_transition) return console.log("Cannot start a transition until the current transition is finished"), 
        m_this;
        var defaultOpts = {
            center: m_this.center(),
            zoom: m_this.zoom(),
            duration: 1e3,
            ease: function(t) {
                return t;
            }
        };
        $.extend(defaultOpts, opts), m_transition = {
            start: {
                center: m_this.center(),
                zoom: m_this.zoom()
            },
            end: {
                center: defaultOpts.center,
                zoom: defaultOpts.zoom
            },
            ease: defaultOpts.ease
        };
        var deltaCenterX = m_transition.end.center.x - m_transition.start.center.x, deltaCenterY = m_transition.end.center.y - m_transition.start.center.y, deltaZoom = m_transition.end.zoom - m_transition.start.zoom;
        return window.requestAnimationFrame(anim), m_this;
    }, this.interactor(arg.interactor || geo.mapInteractor()), this;
}, inherit(geo.map, geo.sceneObject), geo.feature = function(arg) {
    "use strict";
    if (!(this instanceof geo.feature)) return new geo.feature(arg);
    geo.sceneObject.call(this), arg = arg || {};
    var m_this = this, m_selectionAPI = void 0 === arg.selectionAPI ? !1 : arg.selectionAPI, m_style = {}, m_layer = void 0 === arg.layer ? null : arg.layer, m_gcs = void 0 === arg.gcs ? "EPSG:4326" : arg.gcs, m_visible = void 0 === arg.visible ? !0 : arg.visible, m_bin = void 0 === arg.bin ? 0 : arg.bin, m_renderer = void 0 === arg.renderer ? null : arg.renderer, m_data = [], m_dataTime = geo.timestamp(), m_buildTime = geo.timestamp(), m_updateTime = geo.timestamp(), m_selectedFeatures = [];
    return this._bindMouseHandlers = function() {
        m_selectionAPI && (m_this._unbindMouseHandlers(), m_this.geoOn(geo.event.mousemove, m_this._handleMousemove), 
        m_this.geoOn(geo.event.mouseclick, m_this._handleMouseclick), m_this.geoOn(geo.event.brushend, m_this._handleBrushend), 
        m_this.geoOn(geo.event.brush, m_this._handleBrush));
    }, this._unbindMouseHandlers = function() {
        m_this.geoOff(geo.event.mousemove, m_this._handleMousemove), m_this.geoOff(geo.event.mouseclick, m_this._handleMouseclick), 
        m_this.geoOff(geo.event.brushend, m_this._handleBrushend), m_this.geoOff(geo.event.brush, m_this._handleBrush);
    }, this.pointSearch = function() {
        return {
            index: [],
            found: []
        };
    }, this._handleMousemove = function() {
        var mouse = m_this.layer().map().interactor().mouse(), data = m_this.data(), over = m_this.pointSearch(mouse.geo), newFeatures = [], oldFeatures = [];
        newFeatures = over.index.filter(function(i) {
            return m_selectedFeatures.indexOf(i) < 0;
        }), oldFeatures = m_selectedFeatures.filter(function(i) {
            return over.index.indexOf(i) < 0;
        }), newFeatures.forEach(function(i) {
            m_this.geoTrigger(geo.event.feature.mouseover, {
                data: data[i],
                index: i,
                mouse: mouse
            }, !0);
        }), oldFeatures.forEach(function(i) {
            m_this.geoTrigger(geo.event.feature.mouseout, {
                data: data[i],
                index: i,
                mouse: mouse
            }, !0);
        }), over.index.forEach(function(i) {
            m_this.geoTrigger(geo.event.feature.mousemove, {
                data: data[i],
                index: i,
                mouse: mouse
            }, !0);
        }), m_selectedFeatures = over.index;
    }, this._handleMouseclick = function() {
        var mouse = m_this.layer().map().interactor().mouse(), data = m_this.data(), over = m_this.pointSearch(mouse.geo);
        over.index.forEach(function(i) {
            m_this.geoTrigger(geo.event.feature.mouseclick, {
                data: data[i],
                index: i,
                mouse: mouse
            }, !0);
        });
    }, this._handleBrush = function(brush) {
        var idx = m_this.boxSearch(brush.gcs.lowerLeft, brush.gcs.upperRight), data = m_this.data();
        idx.forEach(function(i) {
            m_this.geoTrigger(geo.event.feature.brush, {
                data: data[i],
                index: i,
                mouse: brush.mouse,
                brush: brush
            }, !0);
        });
    }, this._handleBrushend = function(brush) {
        var idx = m_this.boxSearch(brush.gcs.lowerLeft, brush.gcs.upperRight), data = m_this.data();
        idx.forEach(function(i) {
            m_this.geoTrigger(geo.event.feature.brushend, {
                data: data[i],
                index: i,
                mouse: brush.mouse,
                brush: brush
            }, !0);
        });
    }, this.style = function(arg1, arg2) {
        return void 0 === arg1 ? m_style : void 0 === arg2 ? (m_style = $.extend({}, m_style, arg1), 
        m_this.modified(), m_this) : (m_style[arg1] = arg2, m_this.modified(), m_this);
    }, this.layer = function() {
        return m_layer;
    }, this.renderer = function() {
        return m_renderer;
    }, this.drawables = function() {
        return m_this._drawables();
    }, this.gcs = function(val) {
        return void 0 === val ? m_gcs : (m_gcs = val, m_this.modified(), m_this);
    }, this.visible = function(val) {
        return void 0 === val ? m_visible : (m_visible = val, m_this.modified(), m_this);
    }, this.bin = function(val) {
        return void 0 === val ? m_bin : (m_bin = val, m_this.modified(), m_this);
    }, this.dataTime = function(val) {
        return void 0 === val ? m_dataTime : (m_dataTime = val, m_this.modified(), m_this);
    }, this.buildTime = function(val) {
        return void 0 === val ? m_buildTime : (m_buildTime = val, m_this.modified(), m_this);
    }, this.updateTime = function(val) {
        return void 0 === val ? m_updateTime : (m_updateTime = val, m_this.modified(), m_this);
    }, this.data = function(data) {
        return void 0 === data ? m_data : (m_data = data, m_this.dataTime().modified(), 
        m_this.modified(), m_this);
    }, this._init = function(arg) {
        if (!m_layer) throw "Feature requires a valid layer";
        m_style = $.extend({}, {
            opacity: 1
        }, void 0 === arg.style ? {} : arg.style), m_this._bindMouseHandlers();
    }, this._build = function() {}, this._drawables = function() {}, this._update = function() {}, 
    this._exit = function() {
        m_this._unbindMouseHandlers();
    }, this._init(arg), this;
}, geo.event.feature = {
    mousemove: "geo_feature_mousemove",
    mouseover: "geo_feature_mouseover",
    mouseout: "geo_feature_mouseout",
    mouseclick: "geo_feature_mouseclick",
    brushend: "geo_feature_brushend",
    brush: "geo_feature_brush"
}, inherit(geo.feature, geo.sceneObject), geo.pointFeature = function(arg) {
    "use strict";
    if (!(this instanceof geo.pointFeature)) return new geo.pointFeature(arg);
    arg = arg || {}, geo.feature.call(this, arg);
    var m_this = this, m_position = void 0 === arg.position ? function(d) {
        return d;
    } : arg.position, s_init = this._init, m_rangeTree = null, s_data = this.data, s_style = this.style, m_maxRadius = 0;
    return this.position = function(val) {
        return void 0 === val ? m_position : (m_position = val, m_this.dataTime().modified(), 
        m_this._updateRangeTree(), m_this.modified(), m_this);
    }, this._updateRangeTree = function() {
        var pts, position, radius = m_this.style().radius, stroke = m_this.style().stroke, strokeWidth = m_this.style().strokeWidth;
        position = m_this.position(), m_maxRadius = 0, pts = m_this.data().map(function(d, i) {
            var pt = position(d);
            return pt.idx = i, m_maxRadius = Math.max(m_maxRadius, radius(d, i) + (stroke(d, i) ? strokeWidth(d, i) : 0)), 
            pt;
        }), m_rangeTree = new geo.util.RangeTree(pts);
    }, this.pointSearch = function(p) {
        var min, max, data, box, map, pt, idx = [], found = [], ifound = [], stroke = m_this.style().stroke, strokeWidth = m_this.style().strokeWidth, radius = m_this.style().radius;
        return data = m_this.data(), m_this.data && m_this.data.length ? (map = m_this.layer().map(), 
        pt = map.gcsToDisplay(p), min = map.displayToGcs({
            x: pt.x - m_maxRadius,
            y: pt.y + m_maxRadius
        }), max = map.displayToGcs({
            x: pt.x + m_maxRadius,
            y: pt.y - m_maxRadius
        }), box = new geo.util.Box(geo.util.vect(min.x, min.y), geo.util.vect(max.x, max.y)), 
        m_rangeTree.search(box).forEach(function(q) {
            idx.push(q.idx);
        }), idx.forEach(function(i) {
            var dx, dy, rad, d = data[i], p = m_this.position()(d, i);
            rad = radius(data[i], i), rad += stroke(data[i], i) ? strokeWidth(data[i], i) : 0, 
            p = map.gcsToDisplay(p), dx = p.x - pt.x, dy = p.y - pt.y, Math.sqrt(dx * dx + dy * dy) <= rad && (found.push(d), 
            ifound.push(i));
        }), {
            data: found,
            index: ifound
        }) : {
            found: [],
            index: []
        };
    }, this.boxSearch = function(lowerLeft, upperRight) {
        var pos = m_this.position(), idx = [];
        return m_this.data().forEach(function(d, i) {
            var p = pos(d);
            p.x >= lowerLeft.x && p.x <= upperRight.x && p.y >= lowerLeft.y && p.y <= upperRight.y && idx.push(i);
        }), idx;
    }, this.data = function(data) {
        return void 0 === data ? s_data() : (s_data(data), m_this._updateRangeTree(), m_this);
    }, this.style = function(arg1, arg2) {
        return void 0 === arg1 ? s_style() : (s_style(arg1, arg2), m_this._updateRangeTree(), 
        m_this);
    }, this._boundingBox = function(d) {
        var pt, radius;
        return pt = m_this.position()(d), pt = m_this.layer().map().gcsToDisplay(pt), radius = m_this.style().radius(d), 
        {
            min: {
                x: pt.x - radius,
                y: pt.y - radius
            },
            max: {
                x: pt.x + radius,
                y: pt.y + radius
            }
        };
    }, this._init = function(arg) {
        s_init.call(m_this, arg);
        var defaultStyle = $.extend({}, {
            radius: function() {
                return 10;
            },
            stroke: function() {
                return !0;
            },
            strokeColor: function() {
                return {
                    r: 0,
                    g: 1,
                    b: 0
                };
            },
            strokeWidth: function() {
                return 2;
            },
            strokeOpacity: function() {
                return 1;
            },
            fillColor: function() {
                return {
                    r: 1,
                    g: 0,
                    b: 0
                };
            },
            fill: function() {
                return !0;
            },
            fillOpacity: function() {
                return 1;
            },
            sprites: !1,
            sprites_image: null
        }, void 0 === arg.style ? {} : arg.style);
        m_this.style(defaultStyle), m_position && m_this.dataTime().modified();
    }, m_this;
}, geo.event.pointFeature = $.extend({}, geo.event.feature), inherit(geo.pointFeature, geo.feature), 
geo.lineFeature = function(arg) {
    "use strict";
    if (!(this instanceof geo.lineFeature)) return new geo.lineFeature(arg);
    arg = arg || {}, geo.feature.call(this, arg);
    var m_this = this, m_position = void 0 === arg.position ? null : arg.position, m_line = void 0 === arg.line ? null : arg.line, s_init = this._init;
    return this.line = function(val) {
        return void 0 === val ? m_line : (m_line = val, m_this.dataTime().modified(), m_this.modified(), 
        m_this);
    }, this.position = function(val) {
        return void 0 === val ? m_position : (m_position = val, m_this.dataTime().modified(), 
        m_this.modified(), m_this);
    }, this._init = function(arg) {
        s_init.call(m_this, arg);
        var defaultStyle = $.extend({}, {
            strokeWidth: function() {
                return 1;
            },
            strokeColor: function() {
                return {
                    r: 1,
                    g: .8431372549,
                    b: 0
                };
            },
            strokeStyle: function() {
                return "solid";
            },
            strokeOpacity: function() {
                return 1;
            }
        }, void 0 === arg.style ? {} : arg.style);
        m_this.style(defaultStyle), m_position && m_this.dataTime().modified();
    }, this._init(arg), this;
}, inherit(geo.lineFeature, geo.feature), geo.pathFeature = function(arg) {
    "use strict";
    if (!(this instanceof geo.pathFeature)) return new geo.pathFeature(arg);
    arg = arg || {}, geo.feature.call(this, arg);
    var m_this = this, m_position = void 0 === arg.position ? [] : arg.position, s_init = this._init;
    return this.position = function(val) {
        return void 0 === val ? m_position : (m_position = val, m_this.dataTime().modified(), 
        m_this.modified(), m_this);
    }, this._init = function(arg) {
        s_init.call(m_this, arg);
        var defaultStyle = $.extend({}, {
            strokeWidth: function() {
                return 1;
            },
            strokeColor: function() {
                return {
                    r: 1,
                    g: 1,
                    b: 1
                };
            }
        }, void 0 === arg.style ? {} : arg.style);
        m_this.style(defaultStyle), m_position && m_this.dataTime().modified();
    }, this._init(arg), this;
}, inherit(geo.pathFeature, geo.feature), geo.polygonFeature = function(arg) {
    "use strict";
    if (!(this instanceof geo.polygonFeature)) return new geo.polygonFeature(arg);
    arg = arg || {}, geo.feature.call(this, arg);
    var m_this = this, s_init = this._init;
    return this._init = function(arg) {
        s_init.call(m_this, arg);
        var defaultStyle = $.extend({}, {
            color: [ 1, 1, 1 ],
            fill_color: [ 1, 1, 1 ],
            fill: !0
        }, void 0 === arg.style ? {} : arg.style);
        m_this.style(defaultStyle);
    }, m_this._init(arg), m_this;
}, inherit(geo.polygonFeature, geo.feature), geo.planeFeature = function(arg) {
    "use strict";
    if (!(this instanceof geo.planeFeature)) return new geo.planeFeature(arg);
    arg = arg || {}, arg.ul = void 0 === arg.ul ? [ 0, 1, 0 ] : arg.ul, arg.lr = void 0 === arg.lr ? [ 1, 0, 0 ] : arg.lr, 
    arg.depth = void 0 === arg.depth ? 0 : arg.depth, geo.polygonFeature.call(this, arg);
    var m_this = this, m_origin = [ arg.ul.x, arg.lr.y, arg.depth ], m_upperLeft = [ arg.ul.x, arg.ul.y, arg.depth ], m_lowerRight = [ arg.lr.x, arg.lr.y, arg.depth ], m_defaultDepth = arg.depth, m_drawOnAsyncResourceLoad = void 0 === arg.drawOnAsyncResourceLoad ? !0 : !1, s_init = this._init;
    return this.origin = function(val) {
        if (void 0 === val) return m_origin;
        if (val instanceof Array) {
            if (val.length > 3 || val.length < 2) throw "Upper left point requires point in 2 or 3 dimension";
            m_origin = val.slice(0), 2 === m_origin.length && (m_origin[2] = m_defaultDepth);
        } else val instanceof geo.latlng && (m_origin = [ val.x(), val.y(), m_defaultDepth ]);
        return m_this.dataTime().modified(), m_this.modified(), m_this;
    }, this.upperLeft = function(val) {
        if (void 0 === val) return m_upperLeft;
        if (val instanceof Array) {
            if (val.length > 3 || val.length < 2) throw "Upper left point requires point in 2 or 3 dimension";
            m_upperLeft = val.slice(0), 2 === m_upperLeft.length && (m_upperLeft[2] = m_defaultDepth);
        } else val instanceof geo.latlng && (m_upperLeft = [ val.x(), val.y(), m_defaultDepth ]);
        return m_this.dataTime().modified(), m_this.modified(), m_this;
    }, this.lowerRight = function(val) {
        if (void 0 === val) return m_lowerRight;
        if (val instanceof Array) {
            if (val.length > 3 || val.length < 2) throw "Upper left point requires point in 2 or 3 dimension";
            m_lowerRight = val.slice(0), 2 === m_lowerRight.length && (m_lowerRight[2] = m_defaultDepth), 
            m_this.dataTime().modified();
        } else val instanceof geo.latlng && (m_lowerRight = [ val.x(), val.y(), m_defaultDepth ]);
        return m_this.dataTime().modified(), m_this.modified(), m_this;
    }, this.drawOnAsyncResourceLoad = function(val) {
        return void 0 === val ? m_drawOnAsyncResourceLoad : (m_drawOnAsyncResourceLoad = val, 
        m_this);
    }, this._init = function(arg) {
        var style = null;
        s_init.call(m_this, arg), style = m_this.style(), void 0 === style.image && (style.image = null), 
        m_this.style(style);
    }, this._init(arg), this;
}, inherit(geo.planeFeature, geo.polygonFeature), geo.geomFeature = function(arg) {
    "use strict";
    return this instanceof geo.geomFeature ? (arg = arg || {}, geo.feature.call(this, arg), 
    arg.style = void 0 === arg.style ? $.extend({}, {
        color: [ 1, 1, 1 ],
        point_sprites: !1,
        point_sprites_image: null
    }, arg.style) : arg.style, this.style(arg.style), this) : new geo.geomFeature(arg);
}, inherit(geo.geomFeature, geo.feature), geo.graphFeature = function(arg) {
    "use strict";
    if (!(this instanceof geo.graphFeature)) return new geo.graphFeature(arg);
    arg = arg || {}, geo.feature.call(this, arg);
    var m_this = this, s_draw = this.draw, s_style = this.style, m_nodes = null, m_points = null, m_children = function(d) {
        return d.children;
    }, m_links = [], s_init = this._init, s_exit = this._exit;
    return this._init = function(arg) {
        s_init.call(m_this, arg);
        var defaultStyle = $.extend(!0, {}, {
            nodes: {
                radius: function() {
                    return 5;
                },
                fill: function() {
                    return !0;
                },
                fillColor: function() {
                    return {
                        r: 1,
                        g: 0,
                        b: 0
                    };
                },
                strokeColor: function() {
                    return {
                        r: 0,
                        g: 0,
                        b: 0
                    };
                }
            },
            links: {
                strokeColor: function() {
                    return {
                        r: 0,
                        g: 0,
                        b: 0
                    };
                }
            },
            linkType: "path"
        }, void 0 === arg.style ? {} : arg.style);
        m_this.style(defaultStyle), m_this.nodes(function(d) {
            return d;
        });
    }, this._build = function() {
        m_this.children().forEach(function(child) {
            child._build();
        });
    }, this._update = function() {
        m_this.children().forEach(function(child) {
            child._update();
        });
    }, this._exit = function() {
        return m_this.data([]), m_points._exit(), m_this.removeChild(m_points), s_exit(), 
        m_this;
    }, this.style = function(arg) {
        var out = s_style.call(m_this, arg);
        return out !== m_this ? out : (m_points.style(arg.nodes), m_links.forEach(function(l) {
            l.style(arg.links);
        }), m_this);
    }, this.links = function(arg) {
        return void 0 === arg ? m_children : (m_children = geo.util.ensureFunction(arg), 
        m_this);
    }, this.nodes = function(val) {
        return void 0 === val ? m_nodes : (m_nodes = val, m_this.modified(), m_this);
    }, this.nodeFeature = function() {
        return m_points;
    }, this.linkFeatures = function() {
        return m_links;
    }, this.draw = function() {
        var style, layer = m_this.layer(), data = m_this.data(), nLinks = 0;
        return style = m_this.style(), m_points.data(data), m_points.style(style.nodes), 
        data.forEach(function(source) {
            (source.children || []).forEach(function(target) {
                var link;
                nLinks += 1, m_links.length < nLinks && (link = geo.createFeature(style.linkType, layer, layer.renderer()).style(style.links), 
                m_this.addChild(link), m_links.push(link)), m_links[nLinks - 1].data([ source, target ]);
            });
        }), m_links.splice(nLinks, m_links.length - nLinks).forEach(function(l) {
            l._exit(), m_this.removeChild(l);
        }), s_draw(), m_this;
    }, m_points = geo.createFeature("point", this.layer(), this.layer().renderer()), 
    m_this.addChild(m_points), arg.nodes && this.nodes(arg.nodes), this._init(arg), 
    this;
}, inherit(geo.graphFeature, geo.feature), geo.transform = {}, geo.transform.osmTransformFeature = function(destGcs, feature, inplace) {
    "use strict";
    if (!feature) return void console.log("[warning] Invalid (null) feature");
    if (feature.gcs() !== destGcs) {
        if (!(feature instanceof geo.pointFeature || feature instanceof geo.lineFeature)) throw "Supports only point or line feature";
        var i, yCoord, noOfComponents = null, pointOffset = 0, count = null, inPos = null, outPos = null, srcGcs = feature.gcs();
        if (inplace = !!inplace, feature instanceof geo.pointFeature || feature instanceof geo.lineFeature) {
            if ("EPSG:4326" !== srcGcs && geo.transform.transformFeature("EPSG:4326", feature, !0), 
            inPos = feature.positions(), count = inPos.length, !(inPos instanceof Array)) throw "Supports Array of 2D and 3D points";
            if (inPos.length > 0 && inPos[0] instanceof geo.latlng ? (noOfComponents = 2, pointOffset = 1) : (noOfComponents = count % 2 === 0 ? 2 : count % 3 === 0 ? 3 : null, 
            pointOffset = noOfComponents), 2 !== noOfComponents && 3 !== noOfComponents) throw "Transform points require points in 2D or 3D";
            for (outPos = inplace ? inPos : inPos.slice(0), i = 0; count > i; i += pointOffset) yCoord = inPos[i] instanceof geo.latlng ? inPos[i].lat() : inPos[i + 1], 
            yCoord > 85.0511 && (yCoord = 85.0511), -85.0511 > yCoord && (yCoord = -85.0511), 
            inPos[i] instanceof geo.latlng ? outPos[i] = geo.latlng(geo.mercator.lat2y(yCoord), outPos[i].lng()) : outPos[i + 1] = geo.mercator.lat2y(yCoord);
            return inplace && (feature.positions(outPos), feature.gcs(destGcs)), outPos;
        }
        return null;
    }
}, geo.transform.transformFeature = function(destGcs, feature, inplace) {
    "use strict";
    if (!feature) throw "Invalid (null) feature";
    if (!(feature instanceof geo.pointFeature || feature instanceof geo.lineFeature)) throw "Supports only point or line feature";
    if (feature.gcs() === destGcs) return feature.positions();
    if ("EPSG:3857" === destGcs) return geo.transform.osmTransformFeature(destGcs, feature, inplace);
    var i, noOfComponents = null, pointOffset = 0, count = null, inPos = null, outPos = null, projPoint = null, srcGcs = feature.gcs(), projSrcGcs = new proj4.Proj(srcGcs), projDestGcs = new proj4.Proj(destGcs);
    if (inplace = !!inplace, feature instanceof geo.pointFeature || feature instanceof geo.lineFeature) {
        if (inPos = feature.positions(), count = inPos.length, !(inPos instanceof Array)) throw "Supports Array of 2D and 3D points";
        if (inPos.length > 0 && inPos[0] instanceof geo.latlng ? (noOfComponents = 2, pointOffset = 1) : (noOfComponents = count % 2 === 0 ? 2 : count % 3 === 0 ? 3 : null, 
        pointOffset = noOfComponents), 2 !== noOfComponents && 3 !== noOfComponents) throw "Transform points require points in 2D or 3D";
        for (inplace ? outPos = inPos : (outPos = [], outPos.length = inPos.length), i = 0; count > i; i += pointOffset) projPoint = 2 === noOfComponents ? new proj4.Point(inPos[i], inPos[i + 1], 0) : new proj4.Point(inPos[i], inPos[i + 1], inPos[i + 2]), 
        proj4.transform(projSrcGcs, projDestGcs, projPoint), 2 === noOfComponents ? (outPos[i] = projPoint.x, 
        outPos[i + 1] = projPoint.y) : (outPos[i] = projPoint.x, outPos[i + 1] = projPoint.y, 
        outPos[i + 2] = projPoint.z);
        return inplace && (feature.positions(outPos), feature.gcs(destGcs)), outPos;
    }
    return null;
}, geo.transform.transformLayer = function(destGcs, layer, baseLayer) {
    "use strict";
    var features, count, i;
    if (!layer) throw "Requires valid layer for tranformation";
    if (!baseLayer) throw "Requires baseLayer used by the map";
    if (layer !== baseLayer) {
        if (!(layer instanceof geo.featureLayer)) throw "Only feature layer transformation is supported";
        for (features = layer.features(), count = features.length, i = 0, i = 0; count > i; i += 1) "EPSG:3857" === destGcs && baseLayer instanceof geo.osmLayer ? geo.transform.osmTransformFeature(destGcs, features[i], !0) : geo.transform.transformFeature(destGcs, features[i], !0);
        layer.gcs(destGcs);
    }
}, geo.transform.transformCoordinates = function(srcGcs, destGcs, coordinates, numberOfComponents) {
    "use strict";
    function handleLatLngCoordinates() {
        coordinates[0] && coordinates[0] instanceof geo.latlng ? (xAcc = function(index) {
            return coordinates[index].x();
        }, yAcc = function(index) {
            return coordinates[index].y();
        }, writer = function(index, x, y) {
            output[index] = geo.latlng(y, x);
        }) : (xAcc = function() {
            return coordinates.x();
        }, yAcc = function() {
            return coordinates.y();
        }, writer = function(index, x, y) {
            output = geo.latlng(y, x);
        });
    }
    function handleArrayCoordinates() {
        if (coordinates[0] instanceof Array) if (2 === coordinates[0].length) xAcc = function(index) {
            return coordinates[index][0];
        }, yAcc = function(index) {
            return coordinates[index][1];
        }, writer = function(index, x, y) {
            output[index] = [ x, y ];
        }; else {
            if (3 !== coordinates[0].length) throw "Invalid coordinates. Requires two or three components per array";
            xAcc = function(index) {
                return coordinates[index][0];
            }, yAcc = function(index) {
                return coordinates[index][1];
            }, zAcc = function(index) {
                return coordinates[index][2];
            }, writer = function(index, x, y, z) {
                output[index] = [ x, y, z ];
            };
        } else if (2 === coordinates.length) offset = 2, xAcc = function(index) {
            return coordinates[index * offset];
        }, yAcc = function(index) {
            return coordinates[index * offset + 1];
        }, writer = function(index, x, y) {
            output[index] = x, output[index + 1] = y;
        }; else if (3 === coordinates.length) offset = 3, xAcc = function(index) {
            return coordinates[index * offset];
        }, yAcc = function(index) {
            return coordinates[index * offset + 1];
        }, zAcc = function(index) {
            return coordinates[index * offset + 2];
        }, writer = function(index, x, y, z) {
            output[index] = x, output[index + 1] = y, output[index + 2] = z;
        }; else {
            if (!numberOfComponents) throw "Invalid coordinates";
            offset = numberOfComponents, xAcc = function(index) {
                return coordinates[index];
            }, yAcc = function(index) {
                return coordinates[index + 1];
            }, 2 === numberOfComponents ? writer = function(index, x, y) {
                output[index] = x, output[index + 1] = y;
            } : (zAcc = function(index) {
                return coordinates[index + 2];
            }, writer = function(index, x, y, z) {
                output[index] = x, output[index + 1] = y, output[index + 2] = z;
            });
        }
    }
    function handleObjectCoordinates() {
        if (coordinates[0] && "x" in coordinates[0] && "y" in coordinates[0]) xAcc = function(index) {
            return coordinates[index].x;
        }, yAcc = function(index) {
            return coordinates[index].y;
        }, "z" in coordinates[0] ? (zAcc = function(index) {
            return coordinates[index].z;
        }, writer = function(index, x, y, z) {
            output[i] = {
                x: x,
                y: y,
                z: z
            };
        }) : writer = function(index, x, y) {
            output[index] = {
                x: x,
                y: y
            };
        }; else {
            if (!(coordinates && "x" in coordinates && "y" in coordinates)) throw "Invalid coordinates";
            xAcc = function() {
                return coordinates.x;
            }, yAcc = function() {
                return coordinates.y;
            }, "z" in coordinates ? (zAcc = function() {
                return coordinates.z;
            }, writer = function(index, x, y, z) {
                output = {
                    x: x,
                    y: y,
                    z: z
                };
            }) : writer = function(index, x, y) {
                output = {
                    x: x,
                    y: y
                };
            };
        }
    }
    var i, count, offset, xCoord, yCoord, zCoord, xAcc, yAcc, zAcc, writer, output, projPoint, projSrcGcs = new proj4.Proj(srcGcs), projDestGcs = new proj4.Proj(destGcs);
    if (zAcc = function() {
        return 0;
    }, destGcs === srcGcs) return coordinates;
    if (!destGcs || !srcGcs) throw "Invalid source or destination GCS";
    if (coordinates instanceof Array) output = [], output.length = coordinates.length, 
    count = coordinates.length, coordinates[0] instanceof Array || coordinates[0] instanceof geo.latlng || coordinates[0] instanceof Object ? (offset = 1, 
    coordinates[0] instanceof Array ? handleArrayCoordinates() : coordinates[0] instanceof geo.latlng ? handleLatLngCoordinates() : coordinates[0] instanceof Object && handleObjectCoordinates()) : handleArrayCoordinates(); else if (coordinates && coordinates instanceof Object) if (count = 1, 
    offset = 1, coordinates instanceof geo.latlng) handleLatLngCoordinates(); else {
        if (!(coordinates && "x" in coordinates && "y" in coordinates)) throw "Coordinates are not valid";
        handleObjectCoordinates();
    }
    if ("EPSG:3857" === destGcs && "EPSG:4326" === srcGcs) {
        for (i = 0; count > i; i += offset) xCoord = xAcc(i), yCoord = yAcc(i), zCoord = zAcc(i), 
        yCoord > 85.0511 && (yCoord = 85.0511), -85.0511 > yCoord && (yCoord = -85.0511), 
        writer(i, xCoord, geo.mercator.lat2y(yCoord), zCoord);
        return output;
    }
    for (i = 0; count > i; i += offset) return projPoint = new proj4.Point(xAcc(i), yAcc(i), zAcc(i)), 
    proj4.transform(projSrcGcs, projDestGcs, projPoint), writer(i, projPoint.x, projPoint.y, projPoint.z), 
    output;
}, geo.renderer = function(arg) {
    "use strict";
    if (!(this instanceof geo.renderer)) return new geo.renderer(arg);
    geo.object.call(this), arg = arg || {};
    var m_this = this, m_layer = void 0 === arg.layer ? null : arg.layer, m_canvas = void 0 === arg.canvas ? null : arg.canvas, m_initialized = !1;
    return this.layer = function() {
        return m_layer;
    }, this.canvas = function(val) {
        return void 0 === val ? m_canvas : (m_canvas = val, void m_this.modified());
    }, this.map = function() {
        return m_layer ? m_layer.map() : null;
    }, this.baseLayer = function() {
        return m_this.map() ? m_this.map().baseLayer() : void 0;
    }, this.initialized = function(val) {
        return void 0 === val ? m_initialized : (m_initialized = val, m_this);
    }, this.api = function() {
        throw "Should be implemented by derivied classes";
    }, this.reset = function() {
        return !0;
    }, this.worldToGcs = function() {
        throw "Should be implemented by derivied classes";
    }, this.displayToGcs = function() {
        throw "Should be implemented by derivied classes";
    }, this.gcsToDisplay = function() {
        throw "Should be implemented by derivied classes";
    }, this.worldToDisplay = function() {
        throw "Should be implemented by derivied classes";
    }, this.displayToWorld = function() {
        throw "Should be implemented by derivied classes";
    }, this.relMouseCoords = function(event) {
        var totalOffsetX = 0, totalOffsetY = 0, canvasX = 0, canvasY = 0, currentElement = m_this.canvas();
        do totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft, totalOffsetY += currentElement.offsetTop - currentElement.scrollTop, 
        currentElement = currentElement.offsetParent; while (currentElement);
        return canvasX = event.pageX - totalOffsetX, canvasY = event.pageY - totalOffsetY, 
        {
            x: canvasX,
            y: canvasY
        };
    }, this._init = function() {}, this._resize = function() {}, this._render = function() {}, 
    this._exit = function() {}, this._connectMouseEvents = function() {}, this;
}, inherit(geo.renderer, geo.object), geo.osmLayer = function(arg) {
    "use strict";
    function getModifiedMapZoom() {
        return Math.floor(m_this.map().zoom() + m_zoomLevelDelta);
    }
    function isTileVisible(tile) {
        return tile.zoom in m_visibleTilesRange && tile.index_x >= m_visibleTilesRange[tile.zoom].startX && tile.index_x <= m_visibleTilesRange[tile.zoom].endX && tile.index_y >= m_visibleTilesRange[tile.zoom].startY && tile.index_y <= m_visibleTilesRange[tile.zoom].endY ? !0 : !1;
    }
    function drawTiles() {
        m_this._removeTiles(), m_this.draw(), delete m_pendingNewTilesStat[m_updateTimerId];
    }
    function updateOSMTiles(request) {
        void 0 === request && (request = {});
        var zoom = getModifiedMapZoom();
        m_lastVisibleZoom || (m_lastVisibleZoom = zoom), m_this._addTiles(request), m_lastVisibleZoom !== zoom && (m_lastVisibleZoom = zoom), 
        m_this.updateTime().modified();
    }
    if (!(this instanceof geo.osmLayer)) return new geo.osmLayer(arg);
    geo.featureLayer.call(this, arg);
    var m_this = this, m_tiles = {}, m_hiddenBinNumber = 0, m_lastVisibleBinNumber = 999, m_visibleBinNumber = 1e3, m_pendingNewTiles = [], m_pendingInactiveTiles = [], m_numberOfCachedTiles = 0, m_tileCacheSize = 100, m_baseUrl = "http://tile.openstreetmap.org/", m_imageFormat = "png", m_updateTimerId = null, m_lastVisibleZoom = null, m_visibleTilesRange = {}, s_init = this._init, m_pendingNewTilesStat = {}, s_update = this._update, m_updateDefer = null, m_zoomLevelDelta = 2.5;
    return arg && void 0 !== arg.baseUrl && (m_baseUrl = arg.baseUrl), arg && void 0 !== arg.zoomDelta && (m_zoomLevelDelta = arg.zoomDelta), 
    arg && void 0 !== arg.imageFormat && (m_imageFormat = arg.imageFormat), this.tileCacheSize = function(val) {
        return void 0 === val ? m_tileCacheSize : (m_tileCacheSize = val, void m_this.modified());
    }, this.toLocal = function(input) {
        var i, output, delta;
        if (input instanceof Array && input.length > 0) if (output = [], output.length = input.length, 
        input[0] instanceof geo.latlng) for (i = 0; i < input.length; i += 1) output[i] = geo.latlng(input[i]), 
        output[i].lat(geo.mercator.lat2y(output[i].lat())); else if (input[0] instanceof Array) if (delta = input % 3 === 0 ? 3 : 2, 
        2 === delta) for (i = 0; i < input.length; i += delta) output[i] = input[i], output[i + 1] = geo.mercator.lat2y(input[i + 1]); else for (i = 0; i < input.length; i += delta) output[i] = input[i], 
        output[i + 1] = geo.mercator.lat2y(input[i + 1]), output[i + 2] = input[i + 2]; else input[0] instanceof Object && "x" in input[0] && "y" in input[0] && "z" in input[0] ? output[i] = {
            x: input[i].x,
            y: geo.mercator.lat2y(input[i].y),
            z: input[i].z
        } : input[0] instanceof Object && "x" in input[0] && "y" in input[0] && "z" in input[0] ? output[i] = {
            x: input[i].x,
            y: geo.mercator.lat2y(input[i].y)
        } : input.length >= 2 && (output = input.slice(0), output[1] = geo.mercator.lat2y(input[1])); else input instanceof geo.latlng ? (output = {}, 
        output.x = input.x(), output.y = geo.mercator.lat2y(input.y())) : (output = {}, 
        output.x = input.x, output.y = geo.mercator.lat2y(input.y));
        return output;
    }, this.fromLocal = function(input) {
        var i, output;
        if (input instanceof Array && input.length > 0) if (output = [], output.length = input.length, 
        input[0] instanceof Object) for (i = 0; i < input.length; i += 1) output[i] = {}, 
        output[i].x = input[i].x, output[i].y = geo.mercator.y2lat(input[i].y); else if (input[0] instanceof Array) for (i = 0; i < input.length; i += 1) output[i] = input[i], 
        output[i][1] = geo.mercator.y2lat(input[i][1]); else for (i = 0; i < input.length; i += 1) output[i] = input[i], 
        output[i + 1] = geo.mercator.y2lat(input[i + 1]); else output = {}, output.x = input.x, 
        output.y = geo.mercator.y2lat(input.y);
        return output;
    }, this._hasTile = function(zoom, x, y) {
        return m_tiles[zoom] && m_tiles[zoom][x] && m_tiles[zoom][x][y] ? !0 : !1;
    }, this._addTile = function(request, zoom, x, y) {
        if (m_tiles[zoom] || (m_tiles[zoom] = {}), m_tiles[zoom][x] || (m_tiles[zoom][x] = {}), 
        !m_tiles[zoom][x][y]) {
            var noOfTilesX = Math.max(1, Math.pow(2, zoom)), noOfTilesY = Math.max(1, Math.pow(2, zoom)), totalLatDegrees = 360, lonPerTile = 360 / noOfTilesX, latPerTile = totalLatDegrees / noOfTilesY, llx = -180 + x * lonPerTile, lly = .5 * -totalLatDegrees + y * latPerTile, urx = -180 + (x + 1) * lonPerTile, ury = .5 * -totalLatDegrees + (y + 1) * latPerTile, tile = new Image();
            return tile.LOADING = !0, tile.LOADED = !1, tile.REMOVED = !1, tile.REMOVING = !1, 
            tile.crossOrigin = "anonymous", tile.zoom = zoom, tile.index_x = x, tile.index_y = y, 
            tile.llx = llx, tile.lly = lly, tile.urx = urx, tile.ury = ury, tile.lastused = new Date(), 
            tile.src = m_baseUrl + zoom + "/" + x + "/" + (Math.pow(2, zoom) - 1 - y) + "." + m_imageFormat, 
            m_tiles[zoom][x][y] = tile, m_pendingNewTiles.push(tile), m_numberOfCachedTiles += 1, 
            tile;
        }
    }, this._removeTiles = function() {
        var i, x, y, tile, zoom, currZoom = getModifiedMapZoom(), lastZoom = m_lastVisibleZoom;
        if (!m_tiles) return m_this;
        for (zoom in m_tiles) for (x in m_tiles[zoom]) for (y in m_tiles[zoom][x]) tile = m_tiles[zoom][x][y], 
        tile && (tile.REMOVING = !0, m_pendingInactiveTiles.push(tile));
        for (m_pendingInactiveTiles.sort(function(a, b) {
            return a.lastused - b.lastused;
        }), i = 0; m_numberOfCachedTiles > m_tileCacheSize && i < m_pendingInactiveTiles.length; ) tile = m_pendingInactiveTiles[i], 
        isTileVisible(tile) ? i += 1 : (m_this.deleteFeature(tile.feature), delete m_tiles[tile.zoom][tile.index_x][tile.index_y], 
        m_pendingInactiveTiles.splice(i, 1), m_numberOfCachedTiles -= 1);
        for (i = 0; i < m_pendingInactiveTiles.length; i += 1) tile = m_pendingInactiveTiles[i], 
        tile.REMOVING = !1, tile.REMOVED = !1, tile.zoom !== currZoom && tile.zoom === lastZoom ? tile.feature.bin(m_lastVisibleBinNumber) : tile.zoom !== currZoom ? tile.feature.bin(m_hiddenBinNumber) : (tile.lastused = new Date(), 
        tile.feature.bin(m_visibleBinNumber)), tile.feature._update();
        return m_pendingInactiveTiles = [], m_this;
    }, this._addTiles = function(request) {
        function tileOnLoad(tile) {
            var defer = $.Deferred();
            return m_this.addDeferred(defer), function() {
                tile.LOADING = !1, tile.LOADED = !0, (tile.REMOVING || tile.REMOVED) && tile.feature && tile.zoom !== getModifiedMapZoom() ? (tile.feature.bin(m_hiddenBinNumber), 
                tile.REMOVING = !1, tile.REMOVED = !0) : (tile.REMOVED = !1, tile.lastused = new Date(), 
                tile.feature.bin(m_visibleBinNumber)), tile.updateTimerId === m_updateTimerId && m_updateTimerId in m_pendingNewTilesStat ? (tile.feature.bin(m_visibleBinNumber), 
                m_pendingNewTilesStat[m_updateTimerId].count += 1) : (tile.REMOVED = !0, tile.feature.bin(m_hiddenBinNumber)), 
                tile.feature._update(), m_updateTimerId in m_pendingNewTilesStat && m_pendingNewTilesStat[m_updateTimerId].count >= m_pendingNewTilesStat[m_updateTimerId].total && drawTiles(), 
                defer.resolve();
            };
        }
        var feature, lastStartX, lastStartY, lastEndX, lastEndY, currStartX, currStartY, currEndX, currEndY, ren = m_this.renderer(), zoom = getModifiedMapZoom(), llx = 0, lly = m_this.height(), urx = m_this.width(), ury = 0, temp = null, tile = null, tile1x = null, tile1y = null, tile2x = null, tile2y = null, invJ = null, i = 0, j = 0, worldPt1 = ren.displayToWorld([ llx, lly ]), worldPt2 = ren.displayToWorld([ urx, ury ]);
        for (worldPt1[0] = Math.max(worldPt1[0], -180), worldPt1[0] = Math.min(worldPt1[0], 180), 
        worldPt1[1] = Math.max(worldPt1[1], -180), worldPt1[1] = Math.min(worldPt1[1], 180), 
        worldPt2[0] = Math.max(worldPt2[0], -180), worldPt2[0] = Math.min(worldPt2[0], 180), 
        worldPt2[1] = Math.max(worldPt2[1], -180), worldPt2[1] = Math.min(worldPt2[1], 180), 
        tile1x = geo.mercator.long2tilex(worldPt1[0], zoom), tile1y = geo.mercator.lat2tiley(worldPt1[1], zoom), 
        tile2x = geo.mercator.long2tilex(worldPt2[0], zoom), tile2y = geo.mercator.lat2tiley(worldPt2[1], zoom), 
        tile1x = Math.max(tile1x, 0), tile1x = Math.min(Math.pow(2, zoom) - 1, tile1x), 
        tile1y = Math.max(tile1y, 0), tile1y = Math.min(Math.pow(2, zoom) - 1, tile1y), 
        tile2x = Math.max(tile2x, 0), tile2x = Math.min(Math.pow(2, zoom) - 1, tile2x), 
        tile2y = Math.max(tile2y, 0), tile2y = Math.min(Math.pow(2, zoom) - 1, tile2y), 
        tile1x > tile2x && (temp = tile1x, tile1x = tile2x, tile2x = temp), tile2y > tile1y && (temp = tile1y, 
        tile1y = tile2y, tile2y = temp), currStartX = tile1x, currEndX = tile2x, currStartY = Math.pow(2, zoom) - 1 - tile1y, 
        currEndY = Math.pow(2, zoom) - 1 - tile2y, currStartY > currEndY && (temp = currStartY, 
        currStartY = currEndY, currEndY = temp), lastStartX = geo.mercator.long2tilex(worldPt1[0], m_lastVisibleZoom), 
        lastStartY = geo.mercator.lat2tiley(worldPt1[1], m_lastVisibleZoom), lastEndX = geo.mercator.long2tilex(worldPt2[0], m_lastVisibleZoom), 
        lastEndY = geo.mercator.lat2tiley(worldPt2[1], m_lastVisibleZoom), lastStartY = Math.pow(2, m_lastVisibleZoom) - 1 - lastStartY, 
        lastEndY = Math.pow(2, m_lastVisibleZoom) - 1 - lastEndY, lastStartY > lastEndY && (temp = lastStartY, 
        lastStartY = lastEndY, lastEndY = temp), m_visibleTilesRange = {}, m_visibleTilesRange[zoom] = {
            startX: currStartX,
            endX: currEndX,
            startY: currStartY,
            endY: currEndY
        }, m_visibleTilesRange[m_lastVisibleZoom] = {
            startX: lastStartX,
            endX: lastEndX,
            startY: lastStartY,
            endY: lastEndY
        }, m_pendingNewTilesStat[m_updateTimerId] = {
            total: (tile2x - tile1x + 1) * (tile1y - tile2y + 1),
            count: 0
        }, i = tile1x; tile2x >= i; i += 1) for (j = tile2y; tile1y >= j; j += 1) invJ = Math.pow(2, zoom) - 1 - j, 
        m_this._hasTile(zoom, i, invJ) ? (tile = m_tiles[zoom][i][invJ], tile.feature.bin(m_visibleBinNumber), 
        tile.LOADED && m_updateTimerId in m_pendingNewTilesStat && (m_pendingNewTilesStat[m_updateTimerId].count += 1), 
        tile.lastused = new Date(), tile.feature._update()) : tile = m_this._addTile(request, zoom, i, invJ), 
        tile.updateTimerId = m_updateTimerId;
        for (i = 0; i < m_pendingNewTiles.length; i += 1) tile = m_pendingNewTiles[i], feature = m_this.createFeature("plane", {
            drawOnAsyncResourceLoad: !1,
            onload: tileOnLoad(tile)
        }).origin([ tile.llx, tile.lly ]).upperLeft([ tile.llx, tile.ury ]).lowerRight([ tile.urx, tile.lly ]).gcs("EPSG:3857").style("image", tile), 
        tile.feature = feature, tile.feature._update();
        m_pendingNewTiles = [], m_updateTimerId in m_pendingNewTilesStat && m_pendingNewTilesStat[m_updateTimerId].count >= m_pendingNewTilesStat[m_updateTimerId].total && drawTiles();
    }, this._updateTiles = function(request) {
        var defer = $.Deferred();
        return m_this.addDeferred(defer), null !== m_updateTimerId ? (clearTimeout(m_updateTimerId), 
        m_updateDefer.resolve(), m_updateDefer = defer, m_updateTimerId in m_pendingNewTilesStat && delete m_pendingNewTilesStat[m_updateTimerId], 
        m_updateTimerId = setTimeout(function() {
            updateOSMTiles(request), m_updateDefer.resolve();
        }, 100)) : (m_updateDefer = defer, m_updateTimerId = setTimeout(function() {
            updateOSMTiles(request), m_updateDefer.resolve();
        }, 0)), m_this;
    }, this._init = function() {
        return s_init.call(m_this), m_this.gcs("EPSG:3857"), m_this.map().zoomRange({
            min: 0,
            max: 18 - m_zoomLevelDelta
        }), m_this;
    }, this._update = function(request) {
        m_this._updateTiles(request), s_update.call(m_this, request);
    }, this;
}, inherit(geo.osmLayer, geo.featureLayer), geo.registerLayer("osm", geo.osmLayer), 
ggl = ogs.namespace("geo.gl"), ggl.renderer = function(arg) {
    "use strict";
    return this instanceof ggl.renderer ? (geo.renderer.call(this, arg), this.contextRenderer = function() {
        throw "Should be implemented by derived classes";
    }, this) : new ggl.renderer(arg);
}, inherit(ggl.renderer, geo.renderer), geo.registerRenderer("vglRenderer", ggl.vglRenderer), 
ggl.lineFeature = function(arg) {
    "use strict";
    function createVertexShader() {
        var vertexShaderSource = [ "attribute vec3 pos;", "attribute vec3 prev;", "attribute vec3 next;", "attribute float offset;", "attribute vec3 strokeColor;", "attribute float strokeOpacity;", "attribute float strokeWidth;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "uniform float pixelWidth;", "varying vec3 strokeColorVar;", "varying float strokeWidthVar;", "varying float strokeOpacityVar;", "void main(void)", "{", "  vec4 worldPos = projectionMatrix * modelViewMatrix * vec4(pos.xyz, 1);", "  if (worldPos.w != 0.0) {", "    worldPos = worldPos/worldPos.w;", "  }", "  vec4 worldNext = projectionMatrix * modelViewMatrix * vec4(next.xyz, 1);", "  if (worldNext.w != 0.0) {", "    worldNext = worldNext/worldNext.w;", "  }", "  vec4 worldPrev = projectionMatrix* modelViewMatrix * vec4(prev.xyz, 1);", "  if (worldPrev.w != 0.0) {", "    worldPrev = worldPrev/worldPrev.w;", "  }", "  strokeColorVar = strokeColor;", "  strokeWidthVar = strokeWidth;", "  strokeOpacityVar = strokeOpacity;", "  vec2 deltaNext = worldNext.xy - worldPos.xy;", "  vec2 deltaPrev = worldPos.xy - worldPrev.xy;", "  float angleNext = atan(deltaNext.y, deltaNext.x);", "  float anglePrev = atan(deltaPrev.y, deltaPrev.x);", "  if (deltaPrev.xy == vec2(0, 0)) anglePrev = angleNext;", "  if (deltaNext.xy == vec2(0, 0)) angleNext = anglePrev;", "  float angle = (anglePrev + angleNext) / 2.0;", "  float distance = (offset * strokeWidth * pixelWidth) /", "                    cos(anglePrev - angle);", "  worldPos.x += distance * sin(angle);", "  worldPos.y -= distance * cos(angle);", "  vec4  p = worldPos;", "  gl_Position = p;", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
        return shader.setShaderSource(vertexShaderSource), shader;
    }
    function createFragmentShader() {
        var fragmentShaderSource = [ "#ifdef GL_ES", "  precision highp float;", "#endif", "varying vec3 strokeColorVar;", "varying float strokeWidthVar;", "varying float strokeOpacityVar;", "void main () {", "  gl_FragColor = vec4 (strokeColorVar, strokeOpacityVar);", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
        return shader.setShaderSource(fragmentShaderSource), shader;
    }
    function createGLLines() {
        var i, start, posFunc, strokeWidthFunc, strokeColorFunc, strokeOpacityFunc, prev = [], next = [], numPts = m_this.data().length, itemIndex = 0, lineItemIndex = 0, lineItem = null, p = null, position = [], strokeWidth = [], strokeColor = [], strokeOpacity = [], buffers = vgl.DataBuffers(1024), sourcePositions = vgl.sourceDataP3fv(), prevSourcePositions = vgl.sourceDataAnyfv(3, vgl.vertexAttributeKeysIndexed.Four), nextSourcePositions = vgl.sourceDataAnyfv(3, vgl.vertexAttributeKeysIndexed.Five), offsetSourcePositions = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Six), sourceStokeWidth = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.One), sourceStrokeColor = vgl.sourceDataAnyfv(3, vgl.vertexAttributeKeysIndexed.Two), sourceStrokeOpacity = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Three), trianglePrimitive = vgl.triangles(), mat = vgl.material(), blend = vgl.blend(), prog = vgl.shaderProgram(), vertexShader = createVertexShader(), fragmentShader = createFragmentShader(), posAttr = vgl.vertexAttribute("pos"), prevAttr = vgl.vertexAttribute("prev"), nextAttr = vgl.vertexAttribute("next"), offsetAttr = vgl.vertexAttribute("offset"), stokeWidthAttr = vgl.vertexAttribute("strokeWidth"), strokeColorAttr = vgl.vertexAttribute("strokeColor"), strokeOpacityAttr = vgl.vertexAttribute("strokeOpacity"), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix"), pixelWidthUniform = new vgl.floatUniform("pixelWidth", 2 / m_this.renderer().width()), geom = vgl.geometryData(), mapper = vgl.mapper();
        posFunc = m_this.position(), strokeWidthFunc = m_this.style().strokeWidth, strokeColorFunc = m_this.style().strokeColor, 
        strokeOpacityFunc = m_this.style().strokeOpacity, m_this.data().forEach(function(item) {
            lineItem = m_this.line()(item, itemIndex), lineItem.forEach(function(lineItemData) {
                p = posFunc(item, itemIndex, lineItemData, lineItemIndex), position.push(p instanceof geo.latlng ? [ p.x(), p.y(), 0 ] : [ p.x, p.y, p.z || 0 ]), 
                strokeWidth.push(strokeWidthFunc(item, itemIndex, lineItemData, lineItemIndex));
                var sc = strokeColorFunc(item, itemIndex, lineItemData, lineItemIndex);
                if (strokeColor.push([ sc.r, sc.g, sc.b ]), strokeOpacity.push(strokeOpacityFunc(item, itemIndex, lineItemData, lineItemIndex)), 
                0 === lineItemIndex) {
                    var posxx = position[position.length - 1];
                    prev.push(posxx), position.push(posxx), prev.push(posxx), next.push(posxx), strokeWidth.push(strokeWidthFunc(item, itemIndex, lineItemData, lineItemIndex)), 
                    strokeOpacity.push(strokeOpacityFunc(item, itemIndex, lineItemData, lineItemIndex)), 
                    strokeColor.push([ sc.r, sc.g, sc.b ]);
                } else prev.push(position[position.length - 2]), next.push(position[position.length - 1]);
                lineItemIndex += 1;
            }), next.push(position[position.length - 1]), lineItemIndex = 0, itemIndex += 1;
        }), position = geo.transform.transformCoordinates(m_this.gcs(), m_this.layer().map().gcs(), position, 3), 
        prev = geo.transform.transformCoordinates(m_this.gcs(), m_this.layer().map().gcs(), prev, 3), 
        next = geo.transform.transformCoordinates(m_this.gcs(), m_this.layer().map().gcs(), next, 3), 
        buffers.create("pos", 3), buffers.create("next", 3), buffers.create("prev", 3), 
        buffers.create("offset", 1), buffers.create("indices", 1), buffers.create("strokeWidth", 1), 
        buffers.create("strokeColor", 3), buffers.create("strokeOpacity", 1), numPts = position.length, 
        prog.addVertexAttribute(posAttr, vgl.vertexAttributeKeys.Position), prog.addVertexAttribute(stokeWidthAttr, vgl.vertexAttributeKeysIndexed.One), 
        prog.addVertexAttribute(strokeColorAttr, vgl.vertexAttributeKeysIndexed.Two), prog.addVertexAttribute(strokeOpacityAttr, vgl.vertexAttributeKeysIndexed.Three), 
        prog.addVertexAttribute(prevAttr, vgl.vertexAttributeKeysIndexed.Four), prog.addVertexAttribute(nextAttr, vgl.vertexAttributeKeysIndexed.Five), 
        prog.addVertexAttribute(offsetAttr, vgl.vertexAttributeKeysIndexed.Six), prog.addUniform(modelViewUniform), 
        prog.addUniform(projectionUniform), prog.addUniform(pixelWidthUniform), prog.addShader(fragmentShader), 
        prog.addShader(vertexShader), mat.addAttribute(prog), mat.addAttribute(blend), m_actor = vgl.actor(), 
        m_actor.setMaterial(mat), start = buffers.alloc(6 * numPts);
        var currentIndex = start;
        for (i = 0; numPts > i; i += 1) buffers.repeat("strokeWidth", [ strokeWidth[i] ], start + 6 * i, 6), 
        buffers.repeat("strokeColor", strokeColor[i], start + 6 * i, 6), buffers.repeat("strokeOpacity", [ strokeOpacity[i] ], start + 6 * i, 6);
        var addVert = function(p, c, n, offset) {
            buffers.write("prev", p, currentIndex, 1), buffers.write("pos", c, currentIndex, 1), 
            buffers.write("next", n, currentIndex, 1), buffers.write("offset", [ offset ], currentIndex, 1), 
            buffers.write("indices", [ currentIndex ], currentIndex, 1), currentIndex += 1;
        };
        for (i = 1; i < position.length; i += 1) addVert(prev[i - 1], position[i - 1], next[i - 1], 1), 
        addVert(prev[i], position[i], next[i], -1), addVert(prev[i - 1], position[i - 1], next[i - 1], -1), 
        addVert(prev[i - 1], position[i - 1], next[i - 1], 1), addVert(prev[i], position[i], next[i], 1), 
        addVert(prev[i], position[i], next[i], -1);
        sourcePositions.pushBack(buffers.get("pos")), geom.addSource(sourcePositions), prevSourcePositions.pushBack(buffers.get("prev")), 
        geom.addSource(prevSourcePositions), nextSourcePositions.pushBack(buffers.get("next")), 
        geom.addSource(nextSourcePositions), sourceStokeWidth.pushBack(buffers.get("strokeWidth")), 
        geom.addSource(sourceStokeWidth), sourceStrokeColor.pushBack(buffers.get("strokeColor")), 
        geom.addSource(sourceStrokeColor), sourceStrokeOpacity.pushBack(buffers.get("strokeOpacity")), 
        geom.addSource(sourceStrokeOpacity), offsetSourcePositions.pushBack(buffers.get("offset")), 
        geom.addSource(offsetSourcePositions), trianglePrimitive.setIndices(buffers.get("indices")), 
        geom.addPrimitive(trianglePrimitive), mapper.setGeometryData(geom), m_actor.setMapper(mapper);
    }
    if (!(this instanceof ggl.lineFeature)) return new ggl.lineFeature(arg);
    arg = arg || {}, geo.lineFeature.call(this, arg);
    var m_this = this, m_actor = null, s_init = this._init, s_update = this._update;
    return this._init = function(arg) {
        s_init.call(m_this, arg);
    }, this._build = function() {
        m_actor && m_this.renderer().contextRenderer().removeActor(m_actor), createGLLines(), 
        m_this.renderer().contextRenderer().addActor(m_actor), m_this.buildTime().modified();
    }, this._update = function() {
        s_update.call(m_this), (m_this.dataTime().getMTime() >= m_this.buildTime().getMTime() || m_this.updateTime().getMTime() <= m_this.getMTime()) && m_this._build(), 
        m_actor.setVisible(m_this.visible()), m_actor.material().setBinNumber(m_this.bin()), 
        m_this.updateTime().modified();
    }, this._exit = function() {
        m_this.renderer().contextRenderer().removeActor(m_actor);
    }, this._init(arg), this;
}, inherit(ggl.lineFeature, geo.lineFeature), geo.registerFeature("vgl", "line", ggl.lineFeature), 
ggl.pointFeature = function(arg) {
    "use strict";
    function createVertexShader() {
        var vertexShaderSource = [ "attribute vec3 pos;", "attribute vec2 unit;", "attribute float rad;", "attribute vec3 fillColor;", "attribute vec3 strokeColor;", "attribute float fillOpacity;", "attribute float strokeWidth;", "attribute float strokeOpacity;", "attribute float fill;", "attribute float stroke;", "uniform float pixelWidth;", "uniform float aspect;", "uniform mat4 modelViewMatrix;", "uniform mat4 projectionMatrix;", "varying vec3 unitVar;", "varying vec4 fillColorVar;", "varying vec4 strokeColorVar;", "varying float radiusVar;", "varying float strokeWidthVar;", "varying float fillVar;", "varying float strokeVar;", "void main(void)", "{", "  unitVar = vec3 (unit, 1.0);", "  fillColorVar = vec4 (fillColor, fillOpacity);", "  strokeColorVar = vec4 (strokeColor, strokeOpacity);", "  strokeWidthVar = strokeWidth;", "  fillVar = fill;", "  strokeVar = stroke;", "  radiusVar = rad;", "  vec4 p = (projectionMatrix * modelViewMatrix * vec4(pos, 1.0)).xyzw;", "  if (p.w != 0.0) {", "    p = p/p.w;", "  }", "  p += (rad + strokeWidth) * ", "vec4 (unit.x * pixelWidth, unit.y * pixelWidth * aspect, 0.0, 1.0);", "  gl_Position = vec4(p.xyz, 1.0);", "}" ].join("\n"), shader = new vgl.shader(gl.VERTEX_SHADER);
        return shader.setShaderSource(vertexShaderSource), shader;
    }
    function createFragmentShader() {
        var fragmentShaderSource = [ "#ifdef GL_ES", "  precision highp float;", "#endif", "uniform float aspect;", "varying vec3 unitVar;", "varying vec4 fillColorVar;", "varying vec4 strokeColorVar;", "varying float radiusVar;", "varying float strokeWidthVar;", "varying float fillVar;", "varying float strokeVar;", "bool to_bool (in float value) {", "  if (value < 1.0)", "    return false;", "  else", "    return true;", "}", "void main () {", "  bool fill = to_bool (fillVar);", "  bool stroke = to_bool (strokeVar);", "  vec4 strokeColor, fillColor;", "  // No stroke or fill implies nothing to draw", "  if (!fill && !stroke)", "    discard;", "  // Get normalized texture coordinates and polar r coordinate", "  vec2 tex = (unitVar.xy + 1.0) / 2.0;", "  float rad = length (unitVar.xy);", "  // If there is no stroke, the fill region should transition to nothing", "  if (!stroke)", "    strokeColor = vec4 (fillColorVar.rgb, 0.0);", "  else", "    strokeColor = strokeColorVar;", "  // Likewise, if there is no fill, the stroke should transition to nothing", "  if (!fill)", "    fillColor = vec4 (strokeColor.rgb, 0.0);", "  else", "    fillColor = fillColorVar;", "  float radiusWidth = radiusVar;", "  // Distance to antialias over", "  float antialiasDist = 3.0 / (2.0 * radiusVar);", "  if (rad < (radiusWidth / (radiusWidth + strokeWidthVar))) {", "    float endStep = radiusWidth / (radiusWidth + strokeWidthVar);", "    float step = smoothstep (endStep - antialiasDist, endStep, rad);", "    gl_FragColor = mix (fillColor, strokeColor, step);", "  }", "  else {", "    float step = smoothstep (1.0 - antialiasDist, 1.0, rad);", "    gl_FragColor = mix (strokeColor, vec4 (strokeColor.rgb, 0.0), step);", "  }", "}" ].join("\n"), shader = new vgl.shader(gl.FRAGMENT_SHADER);
        return shader.setShaderSource(fragmentShaderSource), shader;
    }
    function createGLPoints() {
        var i, start, posFunc, radFunc, strokeWidthFunc, fillColorFunc, fillFunc, strokeColorFunc, strokeFunc, fillOpacityFunc, strokeOpactityFunc, numPts = m_this.data().length, unit = rect(0, 0, 1, 1), position = [], radius = [], strokeWidth = [], fillColor = [], fill = [], strokeColor = [], stroke = [], fillOpacity = [], strokeOpacity = [], buffers = vgl.DataBuffers(1024), sourcePositions = vgl.sourceDataP3fv(), sourceUnits = vgl.sourceDataAnyfv(2, vgl.vertexAttributeKeysIndexed.One), sourceRadius = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Two), sourceStokeWidth = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Three), sourceFillColor = vgl.sourceDataAnyfv(3, vgl.vertexAttributeKeysIndexed.Four), sourceFill = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Five), sourceStrokeColor = vgl.sourceDataAnyfv(3, vgl.vertexAttributeKeysIndexed.Six), sourceStroke = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Seven), sourceAlpha = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Eight), sourceStrokeOpacity = vgl.sourceDataAnyfv(1, vgl.vertexAttributeKeysIndexed.Nine), trianglesPrimitive = vgl.triangles(), mat = vgl.material(), blend = vgl.blend(), prog = vgl.shaderProgram(), vertexShader = createVertexShader(), fragmentShader = createFragmentShader(), posAttr = vgl.vertexAttribute("pos"), unitAttr = vgl.vertexAttribute("unit"), radAttr = vgl.vertexAttribute("rad"), stokeWidthAttr = vgl.vertexAttribute("strokeWidth"), fillColorAttr = vgl.vertexAttribute("fillColor"), fillAttr = vgl.vertexAttribute("fill"), strokeColorAttr = vgl.vertexAttribute("strokeColor"), strokeAttr = vgl.vertexAttribute("stroke"), fillOpacityAttr = vgl.vertexAttribute("fillOpacity"), strokeOpacityAttr = vgl.vertexAttribute("strokeOpacity"), modelViewUniform = new vgl.modelViewUniform("modelViewMatrix"), projectionUniform = new vgl.projectionUniform("projectionMatrix"), geom = vgl.geometryData(), mapper = vgl.mapper();
        for (m_pixelWidthUniform = new vgl.floatUniform("pixelWidth", 2 / m_this.renderer().width()), 
        m_aspectUniform = new vgl.floatUniform("aspect", m_this.renderer().width() / m_this.renderer().height()), 
        posFunc = m_this.position(), radFunc = m_this.style().radius, strokeWidthFunc = m_this.style().strokeWidth, 
        fillColorFunc = m_this.style().fillColor, fillFunc = m_this.style().fill, strokeColorFunc = m_this.style().strokeColor, 
        strokeFunc = m_this.style().stroke, fillOpacityFunc = m_this.style().fillOpacity, 
        strokeOpactityFunc = m_this.style().strokeOpacity, m_this.data().forEach(function(item) {
            var c, p = posFunc(item);
            position.push([ p.x, p.y, p.z || 0 ]), radius.push(radFunc(item)), strokeWidth.push(strokeWidthFunc(item)), 
            fill.push(fillFunc(item) ? 1 : 0), c = fillColorFunc(item), fillColor.push([ c.r, c.g, c.b ]), 
            c = strokeColorFunc(item), strokeColor.push([ c.r, c.g, c.b ]), stroke.push(strokeFunc(item) ? 1 : 0), 
            fillOpacity.push(fillOpacityFunc(item)), strokeOpacity.push(strokeOpactityFunc(item));
        }), position = geo.transform.transformCoordinates(m_this.gcs(), m_this.layer().map().gcs(), position, 3), 
        buffers.create("pos", 3), buffers.create("indices", 1), buffers.create("unit", 2), 
        buffers.create("rad", 1), buffers.create("strokeWidth", 1), buffers.create("fillColor", 3), 
        buffers.create("fill", 1), buffers.create("strokeColor", 3), buffers.create("stroke", 1), 
        buffers.create("fillOpacity", 1), buffers.create("strokeOpacity", 1), prog.addVertexAttribute(posAttr, vgl.vertexAttributeKeys.Position), 
        prog.addVertexAttribute(unitAttr, vgl.vertexAttributeKeysIndexed.One), prog.addVertexAttribute(radAttr, vgl.vertexAttributeKeysIndexed.Two), 
        prog.addVertexAttribute(stokeWidthAttr, vgl.vertexAttributeKeysIndexed.Three), prog.addVertexAttribute(fillColorAttr, vgl.vertexAttributeKeysIndexed.Four), 
        prog.addVertexAttribute(fillAttr, vgl.vertexAttributeKeysIndexed.Five), prog.addVertexAttribute(strokeColorAttr, vgl.vertexAttributeKeysIndexed.Six), 
        prog.addVertexAttribute(strokeAttr, vgl.vertexAttributeKeysIndexed.Seven), prog.addVertexAttribute(fillOpacityAttr, vgl.vertexAttributeKeysIndexed.Eight), 
        prog.addVertexAttribute(strokeOpacityAttr, vgl.vertexAttributeKeysIndexed.Nine), 
        prog.addUniform(m_pixelWidthUniform), prog.addUniform(m_aspectUniform), prog.addUniform(modelViewUniform), 
        prog.addUniform(projectionUniform), prog.addShader(fragmentShader), prog.addShader(vertexShader), 
        mat.addAttribute(prog), mat.addAttribute(blend), m_actor = vgl.actor(), m_actor.setMaterial(mat), 
        start = buffers.alloc(6 * numPts), i = 0; numPts > i; i += 1) buffers.repeat("pos", position[i], start + 6 * i, 6), 
        buffers.write("unit", unit, start + 6 * i, 6), buffers.write("indices", [ i ], start + i, 1), 
        buffers.repeat("rad", [ radius[i] ], start + 6 * i, 6), buffers.repeat("strokeWidth", [ strokeWidth[i] ], start + 6 * i, 6), 
        buffers.repeat("fillColor", fillColor[i], start + 6 * i, 6), buffers.repeat("fill", [ fill[i] ], start + 6 * i, 6), 
        buffers.repeat("strokeColor", strokeColor[i], start + 6 * i, 6), buffers.repeat("stroke", [ stroke[i] ], start + 6 * i, 6), 
        buffers.repeat("fillOpacity", [ fillOpacity[i] ], start + 6 * i, 6), buffers.repeat("strokeOpacity", [ strokeOpacity[i] ], start + 6 * i, 6);
        sourcePositions.pushBack(buffers.get("pos")), geom.addSource(sourcePositions), sourceUnits.pushBack(buffers.get("unit")), 
        geom.addSource(sourceUnits), sourceRadius.pushBack(buffers.get("rad")), geom.addSource(sourceRadius), 
        sourceStokeWidth.pushBack(buffers.get("strokeWidth")), geom.addSource(sourceStokeWidth), 
        sourceFillColor.pushBack(buffers.get("fillColor")), geom.addSource(sourceFillColor), 
        sourceFill.pushBack(buffers.get("fill")), geom.addSource(sourceFill), sourceStrokeColor.pushBack(buffers.get("strokeColor")), 
        geom.addSource(sourceStrokeColor), sourceStroke.pushBack(buffers.get("stroke")), 
        geom.addSource(sourceStroke), sourceAlpha.pushBack(buffers.get("fillOpacity")), 
        geom.addSource(sourceAlpha), sourceStrokeOpacity.pushBack(buffers.get("strokeOpacity")), 
        geom.addSource(sourceStrokeOpacity), trianglesPrimitive.setIndices(buffers.get("indices")), 
        geom.addPrimitive(trianglesPrimitive), mapper.setGeometryData(geom), m_actor.setMapper(mapper);
    }
    if (!(this instanceof ggl.pointFeature)) return new ggl.pointFeature(arg);
    arg = arg || {}, geo.pointFeature.call(this, arg);
    var m_this = this, m_actor = null, m_pixelWidthUniform = null, m_aspectUniform = null, s_init = this._init, s_update = this._update, rect = function(x, y, w, h) {
        var verts = [ x - w, y + h, x - w, y - h, x + w, y + h, x - w, y - h, x + w, y - h, x + w, y + h ];
        return verts;
    };
    return this._init = function() {
        s_init.call(m_this, arg);
    }, this._build = function() {
        m_actor && m_this.renderer().contextRenderer().removeActor(m_actor), createGLPoints(), 
        m_this.renderer().contextRenderer().addActor(m_actor), m_this.renderer().contextRenderer().render(), 
        m_this.buildTime().modified();
    }, this._update = function() {
        s_update.call(m_this), (m_this.dataTime().getMTime() >= m_this.buildTime().getMTime() || m_this.updateTime().getMTime() < m_this.getMTime()) && m_this._build(), 
        m_pixelWidthUniform.set(2 / m_this.renderer().width()), m_aspectUniform.set(m_this.renderer().width() / m_this.renderer().height()), 
        m_actor.setVisible(m_this.visible()), m_actor.material().setBinNumber(m_this.bin()), 
        m_this.updateTime().modified();
    }, this._exit = function() {
        m_this.renderer().contextRenderer().removeActor(m_actor);
    }, m_this._init(), this;
}, inherit(ggl.pointFeature, geo.pointFeature), geo.registerFeature("vgl", "point", ggl.pointFeature), 
ggl.geomFeature = function(arg) {
    "use strict";
    if (!(this instanceof ggl.geomFeature)) return new ggl.geomFeature(arg);
    arg = arg || {}, geo.geomFeature.call(this, arg);
    var m_this = this, m_geom = arg.geom || null, m_actor = vgl.actor(), m_mapper = vgl.mapper(), m_material = null, m_scalar = null, m_color = arg.color || [ 1, 1, 1 ], m_buildTime = null, m_noOfPrimitives = 0;
    return this._build = function() {
        var style = m_this.style();
        null !== m_geom && (m_scalar = m_geom.sourceData(vgl.vertexAttributeKeys.Scalar), 
        m_color = m_geom.sourceData(vgl.vertexAttributeKeys.Color), m_mapper.setGeometryData(m_geom)), 
        this.setMapper(m_mapper), void 0 !== style.point_sprites && style.point_sprites && void 0 !== style.point_sprites_image && null !== style.point_sprites_image && 1 === m_noOfPrimitives && m_geom.primitive(0).primitiveType() === gl.POINTS ? m_material = vgl.utils.createPointSpritesMaterial(style.point_sprites_image) : m_scalar ? m_color instanceof vgl.lookupTable ? (m_color.updateRange(m_scalar.scalarRange()), 
        m_material = vgl.utils.createColorMappedMaterial(m_color)) : (m_color = vgl.lookupTable(), 
        m_color.updateRange(m_scalar.scalarRange()), m_material = vgl.utils.createColorMappedMaterial(m_color)) : m_material = m_color ? vgl.utils.createColorMaterial() : vgl.utils.createSolidColorMaterial(), 
        m_actor.setMaterial(m_material);
    }, this._update = function() {
        m_buildTime && m_buildTime.getMTime() < m_this.getMTime() ? m_color instanceof vgl.lookupTable && vgl.utils.updateColorMappedMaterial(m_this.material(), m_this.style.color) : (m_buildTime = vgl.timestamp(), 
        m_buildTime.modified());
    }, this.geometry = function(val) {
        return void 0 === val ? m_geom : (m_geom = val, m_this.modified(), m_this);
    }, this;
}, inherit(ggl.geomFeature, geo.geomFeature), ggl.planeFeature = function(arg) {
    "use strict";
    if (!(this instanceof ggl.planeFeature)) return new ggl.planeFeature(arg);
    geo.planeFeature.call(this, arg);
    var m_this = this, m_actor = null, m_onloadCallback = void 0 === arg.onload ? null : arg.onload;
    return this.coords = function() {
        return [ m_this.origin(), m_this.upperLeft(), m_this.lowerRight() ];
    }, this._build = function() {
        var or = m_this.origin(), ul = m_this.upperLeft(), lr = m_this.lowerRight(), img = m_this.style().image, image = null, texture = null;
        or = geo.transform.transformCoordinates(m_this.gcs(), m_this.layer().map().gcs(), or), 
        ul = geo.transform.transformCoordinates(m_this.gcs(), m_this.layer().map().gcs(), ul), 
        lr = geo.transform.transformCoordinates(m_this.gcs(), m_this.layer().map().gcs(), lr), 
        m_this.buildTime().modified(), m_actor && m_this.renderer().contextRenderer().removeActor(m_actor), 
        img && img instanceof Image ? image = img : img && (image = new Image(), image.src = img), 
        image ? (m_actor = vgl.utils.createTexturePlane(or[0], or[1], or[2], lr[0], lr[1], lr[2], ul[0], ul[1], ul[2], !0), 
        texture = vgl.texture(), m_this.visible(!1), m_this.renderer().contextRenderer().addActor(m_actor), 
        image.complete ? (texture.setImage(image), m_actor.material().addAttribute(texture), 
        m_this.visible(!0), m_onloadCallback && m_onloadCallback.call(m_this)) : image.onload = function() {
            texture.setImage(image), m_actor.material().addAttribute(texture), m_this.visible(!0), 
            m_onloadCallback && m_onloadCallback.call(m_this), m_this.drawOnAsyncResourceLoad() && (m_this._update(), 
            m_this.layer().draw());
        }) : (m_actor = vgl.utils.createPlane(or[0], or[1], or[2], ul[0], ul[1], ul[2], lr[0], lr[1], lr[2]), 
        m_this.renderer().contextRenderer().addActor(m_actor));
    }, this._update = function() {
        m_this.buildTime().getMTime() <= m_this.dataTime().getMTime() && m_this._build(), 
        m_this.updateTime().getMTime() <= m_this.getMTime() && (m_actor.setVisible(m_this.visible()), 
        m_actor.material().setBinNumber(m_this.bin())), m_this.updateTime().modified();
    }, this._exit = function() {
        m_this.renderer().contextRenderer().removeActor(m_actor);
    }, this;
}, inherit(ggl.planeFeature, geo.planeFeature), geo.registerFeature("vgl", "plane", ggl.planeFeature), 
ggl._vglViewerInstances = {
    viewers: [],
    maps: []
}, ggl.vglViewerInstance = function(map) {
    "use strict";
    function makeViewer() {
        var canvas = $(document.createElement("canvas"));
        canvas.attr("class", "webgl-canvas");
        var viewer = vgl.viewer(canvas.get(0));
        return viewer.renderWindow().removeRenderer(viewer.renderWindow().activeRenderer()), 
        viewer.init(), viewer;
    }
    var mapIdx, maps = ggl._vglViewerInstances.maps, viewers = ggl._vglViewerInstances.viewers;
    for (mapIdx = 0; mapIdx < maps.length && map !== maps[mapIdx]; mapIdx += 1) ;
    return map !== maps[mapIdx] && (maps[mapIdx] = map, viewers[mapIdx] = makeViewer()), 
    viewers[mapIdx];
}, ggl.vglViewerInstance.deleteCache = function(viewer) {
    "use strict";
    var mapIdx, maps = ggl._vglViewerInstances.maps, viewers = ggl._vglViewerInstances.viewers;
    for (mapIdx = 0; mapIdx < viewers.length && viewer !== viewers[mapIdx]; mapIdx += 1) ;
    viewer === viewers[mapIdx] && (maps.splice(mapIdx, 1), viewers.splice(mapIdx, 1));
}, ggl.vglRenderer = function(arg) {
    "use strict";
    if (!(this instanceof ggl.vglRenderer)) return new ggl.vglRenderer(arg);
    ggl.renderer.call(this, arg);
    var m_this = this, m_viewer = ggl.vglViewerInstance(this.layer().map()), m_contextRenderer = vgl.renderer(), m_width = 0, m_height = 0, s_init = this._init;
    return m_contextRenderer.setResetScene(!1), this.width = function() {
        return m_width;
    }, this.height = function() {
        return m_height;
    }, this.displayToWorld = function(input) {
        var i, delta, output, temp, point, ren = m_this.contextRenderer(), cam = ren.camera(), fdp = ren.focusDisplayPoint();
        if (input instanceof Array && input.length > 0) if (output = [], input[0] instanceof Object) for (delta = 1, 
        i = 0; i < input.length; i += delta) point = input[i], temp = ren.displayToWorld(vec4.fromValues(point.x, point.y, fdp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
        output.push({
            x: temp[0],
            y: temp[1],
            z: temp[2],
            w: temp[3]
        }); else if (input[0] instanceof Array) for (delta = 1, i = 0; i < input.length; i += delta) point = input[i], 
        temp = ren.displayToWorld(vec4.fromValues(point[0], point[1], fdp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
        output.push(temp); else for (delta = input.length % 3 === 0 ? 3 : 2, i = 0; i < input.length; i += delta) temp = ren.displayToWorld(vec4.fromValues(input[i], input[i + 1], fdp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
        output.push(temp[0]), output.push(temp[1]), output.push(temp[2]), output.push(temp[3]); else {
            if (!(input instanceof Object)) throw "Display to world conversion requires array of 2D/3D points";
            output = {}, temp = ren.displayToWorld(vec4.fromValues(input.x, input.y, fdp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
            output = {
                x: temp[0],
                y: temp[1],
                z: temp[2],
                w: temp[3]
            };
        }
        return output;
    }, this.worldToDisplay = function(input) {
        var i, temp, delta, ren = m_this.contextRenderer(), cam = ren.camera(), fp = cam.focalPoint(), output = [];
        if (input instanceof Array && input.length > 0) if (output = [], input[0] instanceof Object) for (delta = 1, 
        i = 0; i < input.length; i += delta) temp = ren.worldToDisplay(vec4.fromValues(input[i].x, input[i].y, fp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
        output[i] = {
            x: temp[0],
            y: temp[1],
            z: temp[2]
        }; else if (input[0] instanceof Array) for (delta = 1, i = 0; i < input.length; i += delta) temp = ren.worldToDisplay(vec4.fromValues(input[i][0], input[i][1], fp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
        output[i].push(temp); else if (delta = input.length % 3 === 0 ? 3 : 2, 2 === delta) for (i = 0; i < input.length; i += delta) temp = ren.worldToDisplay(vec4.fromValues(input[i], input[i + 1], fp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
        output.push(temp[0]), output.push(temp[1]), output.push(temp[2]); else for (i = 0; i < input.length; i += delta) temp = ren.worldToDisplay(vec4.fromValues(input[i], input[i + 1], input[i + 2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
        output.push(temp[0]), output.push(temp[1]), output.push(temp[2]); else {
            if (!(input instanceof Object)) throw "World to display conversion requires array of 2D/3D points";
            temp = ren.worldToDisplay(vec4.fromValues(input.x, input.y, fp[2], 1), cam.viewMatrix(), cam.projectionMatrix(), m_width, m_height), 
            output = {
                x: temp[0],
                y: temp[1],
                z: temp[2]
            };
        }
        return output;
    }, this.contextRenderer = function() {
        return m_contextRenderer;
    }, this.api = function() {
        return "vgl";
    }, this._init = function() {
        return m_this.initialized() ? m_this : (s_init.call(m_this), m_this.canvas($(m_viewer.canvas())), 
        m_viewer.renderWindow().renderers().length > 0 && (m_contextRenderer.setLayer(m_viewer.renderWindow().renderers().length), 
        m_contextRenderer.setResetScene(!1)), m_viewer.renderWindow().addRenderer(m_contextRenderer), 
        m_this.layer().node().append(m_this.canvas()), m_this);
    }, this._resize = function(x, y, w, h) {
        return m_width = w, m_height = h, m_this.canvas().attr("width", w), m_this.canvas().attr("height", h), 
        m_viewer.renderWindow().positionAndResize(x, y, w, h), m_this._render(), m_this;
    }, this._render = function() {
        return m_viewer.render(), m_this;
    }, this._exit = function() {
        ggl.vglViewerInstance.deleteCache(m_viewer);
    }, this._updateRendererCamera = function() {
        var pos, fp, cr, vglRenderer = m_this.contextRenderer(), renderWindow = m_viewer.renderWindow(), camera = vglRenderer.camera();
        vglRenderer.resetCameraClippingRange(), pos = camera.position(), fp = camera.focalPoint(), 
        cr = camera.clippingRange(), renderWindow.renderers().forEach(function(renderer) {
            var cam = renderer.camera();
            cam !== camera && (cam.setPosition(pos[0], pos[1], pos[2]), cam.setFocalPoint(fp[0], fp[1], fp[2]), 
            cam.setClippingRange(cr[0], cr[1]), renderer.render());
        });
    }, this.geoOn(geo.event.pan, function(evt) {
        var camera, focusPoint, centerDisplay, centerGeo, newCenterDisplay, newCenterGeo, renderWindow, vglRenderer = m_this.contextRenderer(), layer = m_this.layer();
        layer.map().baseLayer() === layer && (vglRenderer && vglRenderer.camera() || console.log("Pan event triggered on unconnected vgl renderer."), 
        renderWindow = m_viewer.renderWindow(), camera = vglRenderer.camera(), focusPoint = renderWindow.focusDisplayPoint(), 
        centerDisplay = [ m_width / 2, m_height / 2, 0 ], centerGeo = renderWindow.displayToWorld(centerDisplay[0], centerDisplay[1], focusPoint, vglRenderer), 
        newCenterDisplay = [ centerDisplay[0] + evt.screenDelta.x, centerDisplay[1] + evt.screenDelta.y ], 
        newCenterGeo = renderWindow.displayToWorld(newCenterDisplay[0], newCenterDisplay[1], focusPoint, vglRenderer), 
        camera.pan(centerGeo[0] - newCenterGeo[0], centerGeo[1] - newCenterGeo[1], centerGeo[2] - newCenterGeo[2]), 
        evt.center = {
            x: newCenterGeo[0],
            y: newCenterGeo[1],
            z: newCenterGeo[2]
        }, m_this._updateRendererCamera());
    }), this.geoOn(geo.event.zoom, function(evt) {
        var camera, renderWindow, delta, center, dir, focusPoint, position, newZ, vglRenderer = m_this.contextRenderer(), layer = m_this.layer();
        layer.map().baseLayer() === layer && (vglRenderer && vglRenderer.camera() || console.log("Zoom event triggered on unconnected vgl renderer."), 
        renderWindow = m_viewer.renderWindow(), camera = vglRenderer.camera(), focusPoint = camera.focalPoint(), 
        position = camera.position(), newZ = 360 * Math.pow(2, -evt.zoomLevel), evt.screenPosition ? (center = renderWindow.displayToWorld(evt.screenPosition.x, evt.screenPosition.y, focusPoint, vglRenderer), 
        dir = [ center[0] - position[0], center[1] - position[1], center[2] - position[2] ], 
        position[0] += dir[0] * (1 - newZ / position[2]), position[1] += dir[1] * (1 - newZ / position[2])) : (dir = void 0, 
        delta = -delta), camera.setPosition(position[0], position[1], 360 * Math.pow(2, -evt.zoomLevel)), 
        dir && camera.setFocalPoint(position[0], position[1], focusPoint[2]), m_this._updateRendererCamera());
    }), this;
}, inherit(ggl.vglRenderer, ggl.renderer), geo.registerRenderer("vglRenderer", ggl.vglRenderer), 
gd3 = ogs.namespace("geo.d3"), function(gd3) {
    "use strict";
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz", strLength = 8;
    gd3.uniqueID = function() {
        var i, strArray = [];
        for (strArray.length = strLength, i = 0; strLength > i; i += 1) strArray[i] = chars.charAt(Math.floor(Math.random() * chars.length));
        return strArray.join("");
    }, geo.event.d3Rescale = "geo.d3.rescale";
}(gd3), gd3.object = function(arg) {
    "use strict";
    if (!(this instanceof geo.object)) return new gd3.object(arg);
    geo.sceneObject.call(this);
    var m_id = "d3-" + gd3.uniqueID(), m_this = this, s_draw = this.draw;
    return this._d3id = function() {
        return m_id;
    }, this.select = function() {
        return m_this.renderer().select(m_this._d3id());
    }, this.draw = function() {
        return m_this._update(), s_draw(), m_this;
    }, this._exit = function() {
        return m_this.renderer()._removeFeature(m_this._d3id());
    }, this;
}, inherit(gd3.object, geo.sceneObject), gd3.pointFeature = function(arg) {
    "use strict";
    if (!(this instanceof gd3.pointFeature)) return new gd3.pointFeature(arg);
    arg = arg || {}, geo.pointFeature.call(this, arg), gd3.object.call(this);
    var m_sticky, m_this = this, s_init = this._init, s_update = this._update, m_buildTime = geo.timestamp(), m_style = {};
    return this._init = function(arg) {
        return s_init.call(m_this, arg), m_sticky = m_this.layer().sticky(), m_this;
    }, this._build = function() {
        var data = m_this.data(), s_style = m_this.style(), m_renderer = m_this.renderer(), pos_func = m_this.position();
        return s_update.call(m_this), data || (data = []), m_style.id = m_this._d3id(), 
        m_style.data = data, m_style.append = "circle", m_style.attributes = {
            r: m_renderer._convertScale(s_style.radius),
            cx: function(d) {
                return m_renderer.worldToDisplay(pos_func(d)).x;
            },
            cy: function(d) {
                return m_renderer.worldToDisplay(pos_func(d)).y;
            }
        }, m_style.style = s_style, m_style.classes = [ "d3PointFeature" ], m_this.renderer()._drawFeatures(m_style), 
        m_buildTime.modified(), m_this.updateTime().modified(), m_this;
    }, this._update = function() {
        return s_update.call(m_this), m_this.dataTime().getMTime() >= m_buildTime.getMTime() && m_this._build(), 
        m_this;
    }, this._init(arg), this;
}, inherit(gd3.pointFeature, geo.pointFeature), geo.registerFeature("d3", "point", gd3.pointFeature), 
gd3.lineFeature = function(arg) {
    "use strict";
    if (!(this instanceof gd3.lineFeature)) return new gd3.lineFeature(arg);
    arg = arg || {}, geo.lineFeature.call(this, arg), gd3.object.call(this);
    var m_this = this, s_init = this._init, m_buildTime = geo.timestamp(), s_update = this._update, m_style = {};
    return m_style.style = {}, this._init = function(arg) {
        return s_init.call(m_this, arg), m_this;
    }, this._build = function() {
        var data = m_this.data() || [], s_style = m_this.style(), m_renderer = m_this.renderer(), pos_func = m_this.position(), line = d3.svg.line().x(function(d) {
            return m_renderer.worldToDisplay(pos_func(d)).x;
        }).y(function(d) {
            return m_renderer.worldToDisplay(pos_func(d)).y;
        });
        return s_update.call(m_this), m_style.data = data, m_style.attributes = {
            d: line
        }, m_style.id = m_this._d3id(), m_style.append = "path", m_style.classes = [ "d3LineFeature" ], 
        m_style.style = $.extend({
            fill: function() {
                return !1;
            },
            fillColor: function() {
                return {
                    r: 0,
                    g: 0,
                    b: 0
                };
            }
        }, s_style), m_renderer._drawFeatures(m_style), m_buildTime.modified(), m_this.updateTime().modified(), 
        m_this;
    }, this._update = function() {
        return s_update.call(m_this), m_this.dataTime().getMTime() >= m_buildTime.getMTime() && m_this._build(), 
        m_this;
    }, this._init(arg), this;
}, inherit(gd3.lineFeature, geo.lineFeature), geo.registerFeature("d3", "line", gd3.lineFeature), 
gd3.pathFeature = function(arg) {
    "use strict";
    if (!(this instanceof gd3.pathFeature)) return new gd3.pathFeature(arg);
    arg = arg || {}, geo.pathFeature.call(this, arg), gd3.object.call(this);
    var m_this = this, s_init = this._init, m_buildTime = geo.timestamp(), s_update = this._update, m_style = {};
    return m_style.style = {}, this._init = function(arg) {
        return s_init.call(m_this, arg), m_this;
    }, this._build = function() {
        var tmp, diag, data = m_this.data() || [], s_style = m_this.style(), m_renderer = m_this.renderer();
        return s_update.call(m_this), diag = function(d) {
            var p = {
                source: d.source,
                target: d.target
            };
            return d3.svg.diagonal()(p);
        }, tmp = [], data.forEach(function(d, i) {
            var src, trg;
            i < data.length - 1 && (src = d, trg = data[i + 1], tmp.push({
                source: m_renderer.worldToDisplay(src),
                target: m_renderer.worldToDisplay(trg)
            }));
        }), m_style.data = tmp, m_style.attributes = {
            d: diag
        }, m_style.id = m_this._d3id(), m_style.append = "path", m_style.classes = [ "d3PathFeature" ], 
        m_style.style = $.extend({
            fill: function() {
                return !1;
            },
            fillColor: function() {
                return {
                    r: 0,
                    g: 0,
                    b: 0
                };
            }
        }, s_style), m_this.renderer()._drawFeatures(m_style), m_buildTime.modified(), m_this.updateTime().modified(), 
        m_this;
    }, this._update = function() {
        return s_update.call(m_this), m_this.dataTime().getMTime() >= m_buildTime.getMTime() && m_this._build(), 
        m_this;
    }, this._init(arg), this;
}, inherit(gd3.pathFeature, geo.pathFeature), geo.registerFeature("d3", "path", gd3.pathFeature), 
gd3.graphFeature = function(arg) {
    "use strict";
    var m_this = this;
    return this instanceof gd3.graphFeature ? (geo.graphFeature.call(this, arg), this.select = function() {
        var renderer = m_this.renderer(), selection = {}, node = m_this.nodeFeature(), links = m_this.linkFeatures();
        return selection.nodes = renderer.select(node._d3id()), selection.links = links.map(function(link) {
            return renderer.select(link._d3id());
        }), selection;
    }, this) : new gd3.graphFeature(arg);
}, inherit(gd3.graphFeature, geo.graphFeature), geo.registerFeature("d3", "graph", gd3.graphFeature), 
gd3.d3Renderer = function(arg) {
    "use strict";
    function setAttrs(select, attrs) {
        var key;
        for (key in attrs) attrs.hasOwnProperty(key) && select.attr(key, attrs[key]);
    }
    function setStyles(select, styles) {
        function returnNone() {
            return "none";
        }
        var key, k, f;
        for (key in styles) styles.hasOwnProperty(key) && (f = null, k = null, "strokeColor" === key ? (k = "stroke", 
        f = m_this._convertColor(styles[key], styles.stroke)) : "stroke" === key && styles[key] ? f = returnNone : "strokeWidth" === key ? (k = "stroke-width", 
        f = m_this._convertScale(styles[key])) : "strokeOpacity" === key ? (k = "stroke-opacity", 
        f = styles[key]) : "fillColor" === key ? (k = "fill", f = m_this._convertColor(styles[key], styles.fill)) : "fill" === key && styles[key] ? f = returnNone : "fillOpacity" === key && (k = "fill-opacity", 
        f = styles[key]), k && select.style(k, f));
    }
    function getMap() {
        var layer = m_this.layer();
        return layer ? layer.map() : null;
    }
    function getGroup() {
        return m_svg.select(".group-" + m_this._d3id());
    }
    function initCorners() {
        var layer = m_this.layer(), map = layer.map(), width = m_this.layer().width(), height = m_this.layer().height();
        if (m_width = width, m_height = height, !m_width || !m_height) throw "Map layer has size 0";
        m_corners = {
            upperLeft: map.displayToGcs({
                x: 0,
                y: 0
            }),
            lowerRight: map.displayToGcs({
                x: width,
                y: height
            })
        };
    }
    function setTransform() {
        if (m_corners || initCorners(), m_sticky) {
            var dx, dy, scale, layer = m_this.layer(), map = layer.map(), upperLeft = map.gcsToDisplay(m_corners.upperLeft), lowerRight = map.gcsToDisplay(m_corners.lowerRight), group = getGroup();
            dx = upperLeft.x, dy = upperLeft.y, scale = (lowerRight.y - upperLeft.y) / m_height, 
            group.attr("transform", "matrix(" + [ scale, 0, 0, scale, dx, dy ].join() + ")"), 
            m_scale = scale, m_dx = dx, m_dy = dy;
        }
    }
    function baseToLocal(pt) {
        return {
            x: (pt.x - m_dx) / m_scale,
            y: (pt.y - m_dy) / m_scale
        };
    }
    function localToBase(pt) {
        return {
            x: pt.x * m_scale + m_dx,
            y: pt.y * m_scale + m_dy
        };
    }
    if (!(this instanceof gd3.d3Renderer)) return new gd3.d3Renderer(arg);
    geo.renderer.call(this, arg), gd3.object.call(this, arg), arg = arg || {};
    var m_this = this, m_sticky = null, m_features = {}, m_corners = null, m_width = null, m_height = null, m_scale = 1, m_dx = 0, m_dy = 0, m_svg = null;
    return this._convertColor = function(f, g) {
        return g = g || function() {
            return !0;
        }, function(d) {
            var c;
            return g(d) ? (c = f(d), d3.rgb(255 * c.r, 255 * c.g, 255 * c.b)) : "none";
        };
    }, this._convertPosition = function(f) {
        return function(d) {
            return m_this.worldToDisplay(f(d));
        };
    }, this._convertScale = function(f) {
        return function(d) {
            return f(d) / m_scale;
        };
    }, this._init = function() {
        if (!m_this.canvas()) {
            var canvas;
            m_svg = d3.select(m_this.layer().node().get(0)).append("svg"), canvas = m_svg.append("g"), 
            m_sticky = m_this.layer().sticky(), m_svg.attr("class", m_this._d3id()), m_svg.attr("width", m_this.layer().node().width()), 
            m_svg.attr("height", m_this.layer().node().height()), canvas.attr("class", "group-" + m_this._d3id()), 
            m_this.canvas(canvas);
        }
    }, this.displayToWorld = function(pt) {
        var map = getMap();
        if (!map) throw "Cannot project until this layer is connected to a map.";
        return pt = Array.isArray(pt) ? pt.map(function(x) {
            return map.displayToGcs(localToBase(x));
        }) : map.displayToGcs(localToBase(pt));
    }, this.worldToDisplay = function(pt) {
        var map = getMap();
        if (!map) throw "Cannot project until this layer is connected to a map.";
        var v;
        return v = Array.isArray(pt) ? pt.map(function(x) {
            return baseToLocal(map.gcsToDisplay(x));
        }) : baseToLocal(map.gcsToDisplay(pt));
    }, this.api = function() {
        return "d3";
    }, this.scaleFactor = function() {
        return m_scale;
    }, this._resize = function(x, y, w, h) {
        m_corners || initCorners(), m_svg.attr("width", w), m_svg.attr("height", h), setTransform(), 
        m_this.layer().geoTrigger(geo.event.d3Rescale, {
            scale: m_scale
        }, !0);
    }, this._update = function() {}, this._exit = function() {
        m_features = {}, m_this.canvas().remove();
    }, this._drawFeatures = function(arg) {
        return m_features[arg.id] = {
            data: arg.data,
            index: arg.dataIndex,
            style: arg.style,
            attributes: arg.attributes,
            classes: arg.classes,
            append: arg.append
        }, m_this.__render(arg.id);
    }, this.__render = function(id) {
        var key;
        if (void 0 === id) {
            for (key in m_features) m_features.hasOwnProperty(key) && m_this.__render(key);
            return m_this;
        }
        var data = m_features[id].data, index = m_features[id].index, style = m_features[id].style, attributes = m_features[id].attributes, classes = m_features[id].classes, append = m_features[id].append, selection = m_this.select(id).data(data, index);
        return selection.enter().append(append), selection.exit().remove(), setAttrs(selection, attributes), 
        selection.attr("class", classes.concat([ id ]).join(" ")), setStyles(selection, style), 
        m_this;
    }, this.select = function(id) {
        return getGroup().selectAll("." + id);
    }, this._removeFeature = function(id) {
        return m_this.select(id).remove(), delete m_features[id], m_this;
    }, this.draw = function() {}, this.layer().geoOn(geo.event.pan, setTransform), this.layer().geoOn(geo.event.zoom, function() {
        setTransform(), m_this.__render(), m_this.layer().geoTrigger(geo.event.d3Rescale, {
            scale: m_scale
        }, !0);
    }), this.layer().geoOn(geo.event.resize, function(event) {
        m_this._resize(event.x, event.y, event.width, event.height);
    }), this._init(arg), this;
}, inherit(gd3.d3Renderer, geo.renderer), geo.registerRenderer("d3Renderer", gd3.d3Renderer);
//# sourceMappingURL=geo.min.js.map