window.__ref__ = (function(){
  if (typeof WeakMap !== 'function') {
    console.info('basisjs-tools-instrumenter is not available');
    return function(info, ref){
      return ref;
    };
  }

  var map = new WeakMap();
  var result = function(loc, ref){
    map.set(ref, loc);
    return ref;
  };

  result.set = result;
  result.get = function(ref) {
    return (ref && map.get(ref)) || undefined;
  };

  result.fixSourceOffset = function(source, offset) {
    if (offset && typeof btoa == 'function') {
      offset = String(offset || 0);
                              //{"version":3,"sections":[{"offset":{"line:0,"
      source = source.replace(/(eyJ2ZXJzaW9uIjozLCJzZWN0aW9ucyI6W3sib2Zmc2V0Ijp7ImxpbmUi)OjAs/, '$1' + btoa(':' + offset + ','));
    }

    return source;
  };

  return result;
})();
