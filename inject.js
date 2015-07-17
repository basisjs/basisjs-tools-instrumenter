window.__ref__ = (function(){
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
