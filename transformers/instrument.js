var registratorName = require('../config').registratorName;
var recast = require('recast');
var types = require('ast-types');
var b = types.builders;
var n = types.namedTypes;

function extend(dest, source){
  for (var key in source)
    if (Object.prototype.hasOwnProperty.call(source, key))
      dest[key] = source[key];

  return dest;
}

function wrapNodeReference(loc, name){
  return b.expressionStatement(
    b.callExpression(b.identifier(registratorName), [
      b.objectExpression([
        b.property(
          'init',
          b.identifier('loc'),
          b.literal(loc)
        )
      ]),
      b.identifier(name)
    ])
  );
}

function wrapNode(loc, node){
  return b.callExpression(b.identifier(registratorName), [
    b.objectExpression([
      b.property(
        'init',
        b.identifier('loc'),
        b.literal(loc)
      )
    ]),
    node
  ]);
}

function wrapObjectNode(loc, node, map){
  return b.callExpression(b.identifier(registratorName), [
    b.objectExpression([
      b.property(
        'init',
        b.identifier('loc'),
        b.literal(loc)
      ),
      b.property(
        'init',
        b.identifier('map'),
        b.objectExpression(map)
      )
    ]),
    node
  ]);
}

function buildMap(node, getLocation){
  return node.properties.reduce(function(result, property){
    if (!property.computed && property.kind == 'init') {
      result.push(
        b.property(
          'init',
          extend({}, property.key),
          b.literal(getLocation(property.value))
        )
      );
    }

    return result;
  }, []);
}

module.exports = function(ast, filename){
  recast.visit(ast, {
    getLocation: function(node){
      return [
        filename || '',
        node.loc.start.line,
        node.loc.start.column + 1
      ].join(':');
    },

    visitFunctionDeclaration: function(path){
      var node = path.node;
      var loc = this.getLocation(node);

      this.traverse(path);

      path.insertAfter(wrapNodeReference(loc, node.id.name));
    },
    visitFunctionExpression: function(path){
      var node = path.node;
      var loc = this.getLocation(node);

      this.traverse(path);
      
      path.replace(wrapNode(loc, node));
    },

    visitNewExpression: function(path){
      var node = path.node;
      var loc = this.getLocation(node);

      this.traverse(path);
      
      path.replace(wrapNode(loc, node));
    },

    visitObjectExpression: function(path){
      var node = path.node;
      var loc = this.getLocation(node);
      var map = buildMap(node, this.getLocation);

      this.traverse(path);
      
      path.replace(wrapObjectNode(loc, node, map));
    }
  });
};
