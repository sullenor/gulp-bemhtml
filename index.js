'use strict';

var bemxjst = require('bem-xjst');
var fs = require('fs');
var gutil = require('gulp-util');
var path = require('path');
var through = require('through2');

var PluginError = gutil.PluginError;

var pluginName = path.basename(__dirname);
var syntaxPath = path.resolve('./syntax/i-bem.bemhtml');

/**
 * bemhtml templates compiler.
 * @param {object} options
 * @param {boolean} options.cache
 * @param {string} options.exportName
 * @param {boolean} options.no-opt
 * @param {boolean} options.optimize
 * @param {boolean} options.wrap
 * @return {stream}
 */
module.exports = function (options) {
  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      return callback(null, file);
    }

    if (file.isStream()) {
      return callback(new PluginError(pluginName, 'Streaming not supported'));
    }

    fs.readFile(syntaxPath, {encoding: 'utf8'}, function (err, syntax) {
      if (err) {
        return callback(new PluginError(pluginName, 'Syntax file not found', {
          fileName: syntaxPath
        }));
      }

      var code;

      try {
        code = bemxjst.generate(syntax + file.contents.toString(), options);
      } catch (e) {
        err = e;
      }

      if (err) {
        return callback(new PluginError(pluginName, err, {
          fileName: file.path
        }));
      }

      file.contents = code;
      file.path = gutil.replaceExtension(file.path, '.bemhtml.js');

      callback(null, file);
    });
  });
};