Code instrumenter plugin for basisjs-tools.

## Install

```
npm install basisjs-tools-instrumenter
```

## Usage

Add to `basis.config` those settings:

```json
{
  "plugins": [
    "basisjs-tools-instrumenter"
  ]
}
```

That's all!

> NOTE: You need basisjs-tools 1.5 or highest, as basisjs-tools starts support for plugins since 1.5.

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
        "registratorName": "youOwnName"
      }
    }
  ]
}
```

By `ignore` option we set of file path masks (`minimatch` is used) that should not be instrumented. `registratorName` sets custom name for function that wraps code.

## How does it works

This plugins process all `.js` files and modify (instrument) code to reach main goal: provide location information about some object or function, i.e. tell where value was defined. Let's look for simple example:

```js
var a = {
  foo: 1,
  bar: function(){
    return 123;
  }
};
```

After instrumenting this code will looks:

```js
var a = $loc_h8tz9yd7({
  foo: 1,
  bar: $loc_h8tz9yd7(function () {
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

As you can see, some expressions was wrapped by function `$loc_h8tz9yd7` (it's name by default, but you can set name via `registratorName` function). This function returns first argument as is. But also associates (attach) second argument (meta info) to first argument. `WeakMap` is used for this.

Meta info contains infomation about range in source wrapped expression in source (`loc` property). It also could store some additional infomation like map of object value ranges for object literals.

As code instrumentation pollute original source plugin adds source map to result. This means you'll see original source in browser developer tools instead of instrumented.

It also process `.html` files to inject required API to global scope, and adds reference to those API to `basisjs-config` if any found.

## API

Registraction function has additional methods:

- `set(ref, data)` - it's alias for wrapping function, allows attach `data` (some meta info) to `ref`; if `ref` has already some info, function overrides it
- `get(ref)` - return meta info attached to `ref`, if any

```js
var obj = {};

$loc_h8tz9yd7(obj, { someInfo: 123 });
// or
$loc_h8tz9yd7.set(obj, { someInfo: 123 });

console.log($loc_h8tz9yd7.get(obj));
// { someInfo: 123 }
```
