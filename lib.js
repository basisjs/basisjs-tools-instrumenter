var fs = require('fs');
var recast = require('recast');
var instrument = require('./transformers/instrument');
var config = require('./config.json');

function generateSourceMap(map){
  return [
    '\n//# sourceMappingURL=data:application/json;base64,',
    new Buffer(JSON.stringify(map)).toString('base64')
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
    generateSourceMap(instrumentedCode.map)
  );
};

function processCode(content, filename, cb){
  try {
    cb(null, instrumentCode(content, filename));
  } catch(err) {
    console.warn('Error while instrumenting script: ' + filename);
    cb(null, content);
  }
}

function processFile(filename, cb){
  return fs.readFile(filename, 'utf-8', function(err, content){
    if (err)
      cb(err, null);

    processCode(content, filename, cb);
  });
}

module.exports = {
  instrumentCode: instrumentCode,
  processCode: processCode,
  processFile: processFile
};
