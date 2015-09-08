module.exports = {
  server: function(api, options){
    var processorConfig = {
      registratorName: options.registratorName || '$loc_h8tz9yd7'
    };

    api.addPreprocessor('.html', require('./html-process')(processorConfig));
    api.addPreprocessor('.js', require('./js-process')(processorConfig));
  }
};
