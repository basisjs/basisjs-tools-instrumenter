var fs = require('fs');
var babel = require('babel');

function generateSourceMap(map){
  function toBase64(string){
    return new Buffer(string).toString('base64');
  }

  var mapStr = JSON.stringify(map);

  // align `?instr` in filename to fold 4
  mapStr = mapStr.replace(/(,"sources":\[)("[^"]+")/, function(m, prefix, filename){
    while (filename.length % 3 != 1)
      filename = ' ' + filename;
    return prefix + filename;
  });
  
  // return comment for inject to js
  return (
    '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,' +
    toBase64(mapStr)
  );
}

module.exports = function(options){
  var registratorName = options.registratorName;

  return function instrumentCode(content, filename, cb){
    content = String(content || '');
    filename = filename || 'unknown';

    try {
      var instrumentedCode = babel.transform(content, {
        filename: filename,
        sourceMaps: true,
        sourceFileName: filename + '?instr',
        plugins: [
          require('babel-plugin-source-wrapper')({
            registratorName: registratorName
          })
        ],
        whitelist: [],         // prevent use any other transformers
        blacklist: ['strict']  // prevent add "use strict" to sources
      });

      cb(null, instrumentedCode.code +
        generateSourceMap({
          version: instrumentedCode.map.version,
          sections: [{
            offset: { line: 0, column: 0 },
            map: instrumentedCode.map
          }]
        })
      );
    } catch(e) {
      cb(e);
    }
  }
};
