'use strict';
var registratorName = require('../config').registratorName;

module.exports = function (_ref) {
  var Plugin = _ref.Plugin;
  var acorn = _ref.acorn;
  var t = _ref.types;

  function getLocation(file, node){
    return node.loc ?
      [
        file.opts.filename || '',
        node.loc.start.line,
        node.loc.start.column + 1
      ].join(':')
      : null;
  }

  function extend(dest, source){
    for (var key in source)
      if (Object.prototype.hasOwnProperty.call(source, key))
        dest[key] = source[key];

    return dest;
  }

  function wrapNodeReference(loc, name){
    return t.expressionStatement(
      t.callExpression(t.identifier(registratorName), [
        t.objectExpression([
          t.property(
            'init',
            t.identifier('loc'),
            t.literal(loc)
          )
        ]),
        t.identifier(name)
      ])
    );
  }

  function wrapNode(loc, node){
    return t.callExpression(
      t.identifier(registratorName),
      [
        t.objectExpression([
          t.property(
            'init',
            t.identifier('loc'),
            t.literal(loc)
          )
        ]),
        node
      ]);
  }

  function wrapObjectNode(loc, node, map){
    return t.callExpression(t.identifier(registratorName), [
      t.objectExpression([
        t.property(
          'init',
          t.identifier('loc'),
          t.literal(loc)
        ),
        t.property(
          'init',
          t.identifier('map'),
          t.objectExpression(map)
        )
      ]),
      node
    ]);
  }

  function buildMap(node, getLocation){
    return node.properties.reduce(function(result, property){
      if (!property.computed && property.kind == 'init') {
        result.push(
          t.property(
            'init',
            extend({}, property.key),
            t.literal(getLocation(property.value))
          )
        );
      }
      return result;
    }, []);
  }

  return new Plugin('basis-instrumenter', {
    metadata: { secondPass: false },
    visitor: {
      FunctionDeclaration: function(node, parent, scope, file){
        var loc = getLocation(file, node);
        this.insertAfter(wrapNodeReference(loc, node.id.name));
      },

      FunctionExpression: {
        exit: function(node, parent, scope, file){
          this.skip();
          var loc = getLocation(file, node);
          return wrapNode(loc, node);
        }
      },

      NewExpression: {
        exit: function(node, parent, scope, file){
          this.skip();
          var loc = getLocation(file, node);
          return wrapNode(loc, node);
        }
      },

      ObjectExpression: {
        exit: function(node, parent, scope, file){
          this.skip();
          var loc = getLocation(file, node);
          var map = buildMap(node, getLocation.bind(null, file));
          return wrapObjectNode(loc, node, map);
        }
      }
    }
  });
};
