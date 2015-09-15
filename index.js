module.exports = {
  server: function(api, options) {
    var registratorName = options.registratorName || '$loc_h8tz9yd7';
    var injectScript = require('fs')
      .readFileSync(__dirname + '/js-runtime.js', 'utf-8')
      .replace('__ref__', registratorName)

    var processorConfig = {
      registratorName: registratorName,
      blackbox: Array.isArray(options.blackbox) ? options.blackbox : null,
      injectScriptFilename: api.addVirtualFile('runtime.js', injectScript)
    };

    api.addPreprocessor('.html', require('./html-process')(processorConfig));
    api.addPreprocessor('.js', require('./js-process')(processorConfig));
  }
};
