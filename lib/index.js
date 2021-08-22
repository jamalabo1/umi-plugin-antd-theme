"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _path = require("path");

var _serveStatic = _interopRequireDefault(require("serve-static"));

var _rimraf = _interopRequireDefault(require("rimraf"));

var _fs = require("fs");

var _defaultTheme = _interopRequireDefault(require("./defaultTheme"));

var _genericNames = _interopRequireDefault(require("generic-names"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var buildCss = require('antd-pro-merge-less');

var winPath = require('slash2');

function _default(api) {
  api.modifyDefaultConfig(function (config) {
    config.cssLoader = {
      modules: {
        getLocalIdent: function getLocalIdent(context, _, localName) {
          if (context.resourcePath.includes('node_modules') || context.resourcePath.includes('ant.design.pro.less') || context.resourcePath.includes('global.less')) {
            return localName;
          }

          return (0, _genericNames.default)('[local]___[hash:base64:5]')(localName, context.resourcePath);
        }
      }
    };
    return config;
  }); // 给一个默认的配置

  var options = _defaultTheme.default; // 从固定的路径去读取配置，而不是从 config 中读取

  var themeConfigPath = winPath((0, _path.join)(api.paths.cwd, 'config/theme.config.json'));

  if ((0, _fs.existsSync)(themeConfigPath)) {
    options = require(themeConfigPath);
  }

  var _api$paths = api.paths,
      cwd = _api$paths.cwd,
      absOutputPath = _api$paths.absOutputPath,
      absNodeModulesPath = _api$paths.absNodeModulesPath;
  var outputPath = absOutputPath;
  var themeTemp = winPath((0, _path.join)(absNodeModulesPath, '.plugin-theme')); // 增加中间件

  api.addMiddewares(function () {
    return (0, _serveStatic.default)(themeTemp);
  }); // 增加一个对象，用于 layout 的配合

  api.addHTMLHeadScripts(function () {
    return [{
      content: "window.umi_plugin_ant_themeVar = ".concat(JSON.stringify(options.theme))
    }];
  }); // 编译完成之后

  api.onBuildComplete(function (_ref) {
    var err = _ref.err;

    if (err) {
      return;
    }

    api.logger.info('💄  build theme');

    try {
      if ((0, _fs.existsSync)(winPath((0, _path.join)(outputPath, 'theme')))) {
        _rimraf.default.sync(winPath((0, _path.join)(outputPath, 'theme')));
      }

      (0, _fs.mkdirSync)(winPath((0, _path.join)(outputPath, 'theme')));
    } catch (error) {// console.log(error);
    }

    buildCss(cwd, options.theme.map(function (theme) {
      return _objectSpread(_objectSpread({}, theme), {}, {
        fileName: winPath((0, _path.join)(outputPath, 'theme', theme.fileName))
      });
    }, _objectSpread({
      min: true
    }, options))).then(function () {
      api.logger.log('🎊  build theme success');
    }).catch(function (e) {
      console.log(e);
    });
  }); // dev 之后

  api.onDevCompileDone(function () {
    api.logger.info('cache in :' + themeTemp);
    api.logger.info('💄  build theme'); // 建立相关的临时文件夹

    try {
      if ((0, _fs.existsSync)(themeTemp)) {
        _rimraf.default.sync(themeTemp);
      }

      if ((0, _fs.existsSync)(winPath((0, _path.join)(themeTemp, 'theme')))) {
        _rimraf.default.sync(winPath((0, _path.join)(themeTemp, 'theme')));
      }

      (0, _fs.mkdirSync)(themeTemp);
      (0, _fs.mkdirSync)(winPath((0, _path.join)(themeTemp, 'theme')));
    } catch (error) {// console.log(error);
    }

    buildCss(cwd, options.theme.map(function (theme) {
      return _objectSpread(_objectSpread({}, theme), {}, {
        fileName: winPath((0, _path.join)(themeTemp, 'theme', theme.fileName))
      });
    }), _objectSpread({}, options)).then(function () {
      api.logger.log('🎊  build theme success');
    }).catch(function (e) {
      console.log(e);
    });
  });
}