var fs = require('fs');

module.exports = {
  server: function(api, options) {
    var registratorName = options.registratorName || '$devinfo';
    var injectScript = 
      fs.readFileSync(require.resolve('babel-plugin-source-wrapper/runtime.js'), 'utf-8') +
      fs.readFileSync(__dirname + '/js-runtime.js', 'utf-8');

    var processorConfig = {
      registratorName: registratorName,
      blackbox: Array.isArray(options.blackbox) ? options.blackbox : null,
      injectScriptFilename: api.addVirtualFile('runtime.js',
        injectScript.replace(/DEVINFO_API_NAME/g, '"' + registratorName + '"')
      )
    };

    api.addPreprocessor('.html', require('./html-process')(processorConfig));
    api.addPreprocessor('.js', require('./js-process')(processorConfig));
  }
};
