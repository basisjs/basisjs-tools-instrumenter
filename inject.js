window.__ref__ = (function(){
  if (!window.WeakMap){
    console.warn('code instrumenter not available ');
    return;
  }

  var offset = new Function('a', 'x').toString().split('x')[0].split('\n').length;

  var req = new window.XMLHttpRequest();
  req.open('GET', 'setOptions?jsSourceMapOffset=' + offset, false);
  req.send();

  var map = new WeakMap();
  var result = function(loc, ref){
    map.set(ref, loc);
    return ref;
  };
  result.set = result;
  result.get = function(ref){
    return (ref && map.get(ref)) || undefined;
  };
  return result;
})();
