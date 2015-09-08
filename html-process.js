var htmlTools = require('basisjs-tools-ast').html;

module.exports = function(options){
  var registratorName = options.registratorName;
  var injectCode = require('fs')
    .readFileSync(__dirname + '/js-runtime.js', 'utf-8')
    .replace('__ref__', registratorName);

  return function processHtml(content, filename, cb){
    var ast = htmlTools.parse(content);
    var scripts = htmlTools.getElementsByName(ast, 'script');
    var firstScript = scripts[0];
    var injectScript = {
      type: 'tag',
      name: 'script',
      attribs: {},
      children: [{
        type: 'text',
        data: injectCode
      }]
    };

    scripts.forEach(function(script){
      if (script.attribs) {
        var attrName =
          'data-basis-config' in script.attribs ? 'data-basis-config' :
          'basis-config' in script.attribs ? 'basis-config' :
          false;

        if (attrName) {
          script.attribs[attrName] += '\n,devInfoResolver:' + registratorName;
        }
      }
    });

    if (firstScript) {
      htmlTools.insertBefore(firstScript, injectScript);
    } else {
      htmlTools.injectToHead(ast, injectScript);
    }

    cb(null, htmlTools.translate(ast));
  };
};
