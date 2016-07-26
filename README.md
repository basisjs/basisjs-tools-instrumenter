# basisjs-tools-instrumenter

[![NPM version](https://img.shields.io/npm/v/basisjs-tools-instrumenter.svg)](https://www.npmjs.com/package/basisjs-tools-instrumenter)
[![Dependency Status](https://img.shields.io/david/basisjs/basisjs-tools-instrumenter.svg)](https://david-dm.org/basisjs/basisjs-tools-instrumenter)

Source code instrumenting plugin for [basisjs-tools](https://github.com/basisjs/basisjs-tools). Based on [Babel](https://github.com/babel/babel) and [babel-plugin-source-wrapper](https://github.com/restrry/babel-plugin-source-wrapper).

## Install

```
npm install basisjs-tools-instrumenter
```

## Usage

> NOTE: `basisjs-tools` 1.5 or highest is required.

Add to `basis.config` those settings:

```json
{
  "plugins": [
    "basisjs-tools-instrumenter"
  ]
}
```

That's all!

You could pass additional parameters for plugin:

```json
{
  "plugins": [
    {
      "name": "basisjs-tools-instrumenter",
      "ignore": [
        "build/**"
      ],
      "options": {
        "registratorName": "youOwnName",
        "blackbox": ["/build/**"]
      }
    }
  ]
}
```

By `ignore` option we set of file path masks (`minimatch` is used) that should not to be instrumented.

### Options

All options are optional.

#### registratorName

- Type: `String`
- Default: `$devinfo`

Set custom name for API.

#### blackbox

- Type: `Array` or `false`
- Default: `["/bower_compontents/**", "/node_modules/**"]`

List of `minimatch` masks for source filenames, which dev info should be marked as `blackbox`. Info with `blackbox: true` has lower priority and overrides by info without this marker.

## How does it works

This plugins process all `.js` files and modify (instrument) code to provide location information about some object or function later, i.e. answer to question where value was defined. Let's look for simple example:

```js
var a = {
  foo: 1,
  bar: function(){
    return 123;
  }
};
```

It will be instrumented to:

```js
var a = $devinfo({
  foo: 1,
  bar: $devinfo(function () {
    return 123;
  }, {
    loc: "filename:3:8:5:4"
  })
}, {
  loc: "filename:1:9:6:2",
  map: {
    foo: "filename:2:8:2:9",
    bar: "filename:3:8:5:4"
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzZWN0aW9ucyI6…AxLFxuICBiYXI6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIDEyMztcbiAgfVxufTsiXX19XX0=
```

As you can see, some expressions was wrapped by function `$devinfo()` (default name, but you can set it via `registratorName` option). This function returns first argument as is. But associates (attach) second argument (meta data) to first argument. `WeakMap` is used for that.

Meta data contains infomation about wrapped expression range in source (`loc` property). It can store additional infomation in some cases, e.g. map of object value ranges for object literals.

Since instrumentation corrupt original code plugin adds source map to result. It means you'll see original source in browser's developer tools instead of instrumented.

It also process `.html` files to inject required API to global scope, and adds reference to those API to `basisjs-config` if any found.

## API

Registraction function has additional methods:

- `set(ref, data)` - it's alias for wrapping function, allows attach `data` (some meta info) to `ref`; if `ref` has already some info, function overrides it
- `get(ref)` - return meta info attached to `ref`, if any

```js
var obj = {};

$devinfo(obj, { someInfo: 123 });
// or
$devinfo.set(obj, { someInfo: 123 });

console.log($devinfo.get(obj));
// { someInfo: 123 }
```

## Using with webpack

Plugin can be used with `webpack`. In this case `webpack` should instrument source code by `Babel` and [babel-plugin-source-wrapper](https://github.com/restrry/babel-plugin-source-wrapper) and `basisjs-tools-instrumenter` should do everything else except instrumenting.

Settings for Babel in `webpack.config.js`:

```js
module.exports = {
  // ...
  babel: {
    sourceMaps: true,  // source maps are required
    plugins: [
      // in case you use React, this plugin should be applied
      // before babel-plugin-source-wrapper
      // otherwise component names will not to be shown propertly
      require('babel-plugin-react-display-name'),

      // plugin to instrument source code
      require('babel-plugin-source-wrapper')({
        // webpack sends absolute paths to plugins
        // but we need paths relative to project root
        basePath: process.cwd()
      })
    ]
  }
};
```

Disallow instrumenting for `basisjs-tools-instrumenter` in `basis.config`:

```json
{
  "plugins": [
    {
      "name": "basisjs-tools-instrumenter",
      "ignore": ["**/*.js"]
    }
  ]
}
```
