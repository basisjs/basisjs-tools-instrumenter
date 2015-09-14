var html = require('basisjs-tools-ast').html;

module.exports = function(options){
  var registratorName = options.registratorName;
  var injectScriptFilename = options.injectScriptFilename;

  return function processHtml(content, filename, cb) {
    var ast = html.parse(content);
    var scripts = html.getElementsByName(ast, 'script');
    var firstScript = scripts[0];
    var injectScript = {
      type: 'tag',
      name: 'script',
      attribs: {
        src: injectScriptFilename
      },
      children: []
    };

    scripts.forEach(function(script) {
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
      html.insertBefore(firstScript, injectScript);
    } else {
      html.injectToHead(ast, injectScript);
    }

    cb(null, html.translate(ast));
  };
};
