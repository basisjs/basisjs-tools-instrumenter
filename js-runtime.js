window.__ref__ = (function(){
  if (typeof WeakMap !== 'function') {
    console.info('basisjs-tools-instrumenter is not available');
    return function(ref){
      return ref;
    };
  }

  var map = new WeakMap();
  var result = function(ref, data){
    if (ref && (typeof ref === 'object' || typeof ref === 'function')) {
      var curData = map.get(ref);
      if (!curData || (curData.blackbox && !data.blackbox)) {
        map.set(ref, data);
      }
    }

    return ref;
  };

  result.set = result;
  result.get = function(ref) {
    return (ref && map.get(ref)) || undefined;
  };

  result.fixSourceOffset = function(source, offset) {
    if (offset && typeof btoa == 'function') {
      offset = ':' + (offset || 0) + ',';
      while (offset.length % 3) offset += ' ';  // get rid of base64 padding
      source = source
        //{"version":3,"sections":[{"offset":{"line:0,"
        .replace(/(eyJ2ZXJzaW9uIjozLCJzZWN0aW9ucyI6W3sib2Zmc2V0Ijp7ImxpbmUi)OjAs/, '$1' + btoa(offset))
        // cut off ?instr
        .replace(/P2luc3Ry/, '');
    }

    return source;
  };

  return result;
})();
