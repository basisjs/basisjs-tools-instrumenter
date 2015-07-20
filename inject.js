window.__ref__ = (function(){
  if (typeof WeakMap !== 'function') {
    console.info('basisjs-tools-instrumenter is not available');
    return function(info, ref){
      return ref;
    };
  }

  var BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.split('');
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
    function toBase64(input) {
      var output = '';
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var len = input.length;
      var i = 0;

      while (i < len) {
        chr1 = input.charCodeAt(i++);
        chr2 = input.charCodeAt(i++) || 32;
        chr3 = input.charCodeAt(i++) || 32;

        enc1 = chr1 >> 2;
        enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
        enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
        enc4 = chr3 & 63;

        output += BASE64[enc1] + BASE64[enc2] + BASE64[enc3] + BASE64[enc4];
      }

      return output;
    }

    if (offset) {
      offset = String(offset || 0);
      source = source.replace(/(eyJ2ZXJzaW9uIjozLCJzZWN0aW9ucyI6W3sib2Zmc2V0Ijp7ImxpbmUi)OjAs/, '$1' + toBase64(':' + offset + ','));
    }

    return source;
  };

  return result;
})();
