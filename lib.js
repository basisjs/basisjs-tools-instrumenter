var fs = require('fs');
var recast = require('recast');
var instrument = require('./transformers/instrument');

function generateSourceMap(map){
  function toBase64(string){
    return new Buffer(string).toString('base64')
  }

  return [
    '\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,',
    toBase64(JSON.stringify(map))
  ].join('');
}

function instrumentCode(content, filename){
  var ast = recast.parse(content, {
    // sourceFileName should point on the same file
    sourceFileName: filename
  });

  instrument(ast, filename);

  var instrumentedCode = recast.print(ast, {
    sourceMapName: filename + '.map'
  });

  return instrumentedCode.code.concat(
    generateSourceMap({
      version: instrumentedCode.map.version,
      sections: [{
        offset: { line: 0, column: 0 },
        map: instrumentedCode.map
      }]
    })
  );
};

function processCode(content, filename, cb){
  try {
    cb(null, instrumentCode(content, filename));
  } catch(err) {
    console.warn('Error while instrumenting script: ' + filename, err);
    cb(null, content);
  }
};

function processFile(filename, cb){
  return fs.readFile(filename, 'utf-8', function(err, content){
    if (err)
      cb(err, null);

    processCode(content, filename, cb);
  });
};

module.exports = {
  instrumentCode: instrumentCode,
  processCode: processCode,
  processFile: processFile
};
