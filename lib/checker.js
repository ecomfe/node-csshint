'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkString = checkString;
exports.check = check;

var _path = require('path');

var _fs = require('fs');

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _util = require('./util');

var _edpCore = require('edp-core');

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

'use strict';

/**
 * rule 逻辑实现的文件夹路径
 */
/**
 * @file checker 针对 css 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var ruleDir = (0, _path.join)(__dirname, './rule');

/**
 * 检测的默认配置
 *
 * @type {Object}
 */
var DEFAULT_CONFIG = (0, _config.loadConfig)('.', true);

/**
 * 为 max-error 服务的，记录整个的错误个数
 *
 * @type {number}
 */
global.CSSHINT_INVALID_ALL_COUNT = 0;

/**
 * 记录项目级别的 font-family 大小写信息，key 为小写格式，value 为真实的值
 * {'arial': 'Arial'}
 *
 * @type {Object}
 */
global.CSSHINT_FONTFAMILY_CASE_FLAG = {};

/**
 * 匹配行内 csshint key: value, ... 的正则
 *
 * @type {RegExp}
 */
var INLINE_PATTERN = /\/\*+\s*\bcsshint[^-disable]\b\s*(.*)\s*\*\//gmi;

/**
 * 分析行内注释
 *
 * @param {string} fileContent 当前检测的文件内容
 * @param {Object} rcConfig 当前检测的文件的检测规则
 *
 * @return {Object} inline Rule
 */
var analyzeInlineRule = function analyzeInlineRule(fileContent, rcConfig) {
    var ret = {};
    var inlineObj = null;
    var match = null;

    /* jshint loopfunc:true */
    /* eslint-disable no-extra-boolean-cast, no-loop-func */
    while (!!(match = INLINE_PATTERN.exec(fileContent))) {
        var matchRules = match[1];
        var jsonStr = matchRules.replace(/([^,]*)(?=:)/g, function (word) {
            if (word) {
                word = word.replace(/\s/g, '');
                return '"' + word + '"';
            }
            return '';
        });
        jsonStr = '{' + jsonStr + '}';

        try {
            inlineObj = JSON.parse(jsonStr);
        } catch (e) {}

        if (inlineObj) {
            for (var p in inlineObj) {
                if (rcConfig.hasOwnProperty(p)) {
                    ret[p] = inlineObj[p];
                }
            }
        }
    }
    /* eslint-enable no-extra-boolean-cast, no-loop-func */
    return ret;
};

/**
 * 匹配行内 csshint-disable xxx, yyy, zzz 的正则
 *
 * @type {RegExp}
 */
var INLINE_DISABLE_PATTERN = /\/\*+\s*\bcsshint\-disable\b\s*([^\*\/]*)\s*\*\//gmi;

/**
 * 分析行内 disable 注释
 *
 * @param {string} fileContent 当前检测的文件内容
 * @param {Object} rcConfig 当前检测的文件的检测规则
 *
 * @return {Object} inline Rule
 */
var analyzeInlineDisableRule = function analyzeInlineDisableRule(fileContent, rcConfig) {
    var ret = {};
    var match = null;
    /* eslint-disable no-extra-boolean-cast */
    while (!!(match = INLINE_DISABLE_PATTERN.exec(fileContent))) {
        var matchedRules = match[1];
        if (matchedRules) {
            var simpleMatchedRules = matchedRules.split(/[^a-z-]/gmi);
            for (var i = 0, len = simpleMatchedRules.length; i < len; i++) {
                simpleMatchedRules[i] && (ret[(0, _util.trim)(simpleMatchedRules[i])] = false);
            }
        } else {
            for (var p in rcConfig) {
                if (rcConfig.hasOwnProperty(p)) {
                    ret[p] = false;
                }
            }
        }
    }
    /* eslint-enable no-extra-boolean-cast */
    return ret;
};

/**
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 * @param {string} filePath 文件路径
 * @param {Object=} rcConfig 检测规则的配置，可选
 *
 * @return {Promise} Promise 回调函数的参数即错误信息的集合 {ruleName, line, col, errorChar, message, colorMessage}
 */
function checkString(fileContent, filePath) {
    var rcConfig = arguments.length <= 2 || arguments[2] === undefined ? DEFAULT_CONFIG : arguments[2];


    global.CSSHINT_FONTFAMILY_CASE_FLAG = {};

    // 这里把文件内容的 \r\n 统一替换成 \n，便于之后获取行号
    fileContent = fileContent.replace(/\r\n?/g, '\n');

    // 行内注释改变规则配置
    var inline = analyzeInlineRule(fileContent, rcConfig);

    // 行内注释取消规则配置
    var inlineDisable = analyzeInlineDisableRule(fileContent, rcConfig);

    var realConfig = _edpCore.util.extend({}, rcConfig, inline, inlineDisable);

    var maxError = parseInt(realConfig['max-error'], 10);

    // maxError 为 0 或者非数字的情况，则表示忽略 maxError 即是最大值
    if (isNaN(maxError) || maxError === 0) {
        maxError = Number.MAX_VALUE;
    }

    // postcss 插件集合即规则检测的文件集合
    var plugins = [];

    Object.getOwnPropertyNames(realConfig).forEach(function (prop) {
        var ruleFilePath = (0, _path.join)(ruleDir, prop) + '.js';
        if ((0, _fs.existsSync)(ruleFilePath)) {
            plugins.push(require((0, _path.join)(ruleDir, prop)).check({
                ruleVal: realConfig[prop],
                // 实际上在 postcss 的 plugin 里面通过 node.source.input.css 也可以拿到文件内容
                // 但是通过这种方式拿到的内容是去掉 BOM 的，因此在检测 no-bom 规则时候会有问题
                // 所以这里把文件的原内容传入进去
                fileContent: fileContent,
                filePath: filePath,
                maxError: maxError
            }));
        }
    });

    // 不合法的信息集合
    var invalidList = [];

    var invalid = {
        path: '',
        messages: []
    };

    var checkPromise = new Promise(function (resolve, reject) {
        (0, _postcss2.default)(plugins).process(fileContent).then(function (result) {
            result.warnings().forEach(function (data) {
                invalid.messages.push({
                    ruleName: data.ruleName,
                    line: data.line,
                    col: data.col,
                    errorChar: data.errorChar || '',
                    message: data.message,
                    colorMessage: data.colorMessage
                });
                if (invalid.path !== filePath) {
                    invalid.path = filePath;
                    invalidList.push(invalid);
                }
            });
            resolve(invalidList);
        }).catch(function (e) {
            console.log('e: ', e);
            var line = e.line;
            // 根据 line 是否存在来判断是 css parse 的错误还是程序的错误
            /* istanbul ignore else */
            if (line) {
                var lineContent = (0, _util.getLineContent)(e.line, fileContent) || '';
                invalid.messages.push({
                    line: e.line,
                    col: e.column,
                    message: '' + 'CssSyntaxError: ' + e.message,
                    colorMessage: '' + _chalk2.default.red('CssSyntaxError <' + e.reason + '>: ') + _chalk2.default.grey((0, _util.changeColorByIndex)(lineContent, 0, lineContent.substring(0, e.column - 1)))
                });
            } else {
                var str = e.toString();
                invalid.messages.push({
                    message: str,
                    colorMessage: _chalk2.default.red(str)
                });
            }

            if (invalid.path !== filePath) {
                invalid.path = filePath;
                invalidList.push(invalid);
            }

            reject(invalidList);
        });
    });

    return checkPromise;
}

/**
 * 校验文件
 *
 * @param {Object} file 包含 path, content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 *
 * @return {Function} checkString
 */
function check(file, errors, done) {
    // .csshintignore 中配置的文件是指可以忽略 csshint 的文件
    if ((0, _util.isIgnored)(file.path, '.csshintignore')) {
        done();
        return;
    }

    /**
     * checkString 的 promise 的 reject 和 resolve 的返回值的结构以及处理方式都是一样的
     * reject 指的是 CssSyntaxError 的错误。
     * resolve 代表的是 csshint 检测出来的问题
     *
     * @param {Array.<Object>} invalidList 错误信息集合
     */
    var callback = function callback(invalidList) {
        if (invalidList.length) {
            invalidList.forEach(function (invalid) {
                errors.push({
                    path: invalid.path,
                    messages: invalid.messages
                });
            });
        }
        done();
    };

    return checkString(file.content, file.path).then(callback).catch(callback);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jaGVja2VyLmpzIl0sIm5hbWVzIjpbImNoZWNrU3RyaW5nIiwiY2hlY2siLCJydWxlRGlyIiwiX19kaXJuYW1lIiwiREVGQVVMVF9DT05GSUciLCJnbG9iYWwiLCJDU1NISU5UX0lOVkFMSURfQUxMX0NPVU5UIiwiQ1NTSElOVF9GT05URkFNSUxZX0NBU0VfRkxBRyIsIklOTElORV9QQVRURVJOIiwiYW5hbHl6ZUlubGluZVJ1bGUiLCJmaWxlQ29udGVudCIsInJjQ29uZmlnIiwicmV0IiwiaW5saW5lT2JqIiwibWF0Y2giLCJleGVjIiwibWF0Y2hSdWxlcyIsImpzb25TdHIiLCJyZXBsYWNlIiwid29yZCIsIkpTT04iLCJwYXJzZSIsImUiLCJwIiwiaGFzT3duUHJvcGVydHkiLCJJTkxJTkVfRElTQUJMRV9QQVRURVJOIiwiYW5hbHl6ZUlubGluZURpc2FibGVSdWxlIiwibWF0Y2hlZFJ1bGVzIiwic2ltcGxlTWF0Y2hlZFJ1bGVzIiwic3BsaXQiLCJpIiwibGVuIiwibGVuZ3RoIiwiZmlsZVBhdGgiLCJpbmxpbmUiLCJpbmxpbmVEaXNhYmxlIiwicmVhbENvbmZpZyIsImV4dGVuZCIsIm1heEVycm9yIiwicGFyc2VJbnQiLCJpc05hTiIsIk51bWJlciIsIk1BWF9WQUxVRSIsInBsdWdpbnMiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZm9yRWFjaCIsInJ1bGVGaWxlUGF0aCIsInByb3AiLCJwdXNoIiwicmVxdWlyZSIsInJ1bGVWYWwiLCJpbnZhbGlkTGlzdCIsImludmFsaWQiLCJwYXRoIiwibWVzc2FnZXMiLCJjaGVja1Byb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInByb2Nlc3MiLCJ0aGVuIiwicmVzdWx0Iiwid2FybmluZ3MiLCJydWxlTmFtZSIsImRhdGEiLCJsaW5lIiwiY29sIiwiZXJyb3JDaGFyIiwibWVzc2FnZSIsImNvbG9yTWVzc2FnZSIsImNhdGNoIiwiY29uc29sZSIsImxvZyIsImxpbmVDb250ZW50IiwiY29sdW1uIiwicmVkIiwicmVhc29uIiwiZ3JleSIsInN1YnN0cmluZyIsInN0ciIsInRvU3RyaW5nIiwiZmlsZSIsImVycm9ycyIsImRvbmUiLCJjYWxsYmFjayIsImNvbnRlbnQiXSwibWFwcGluZ3MiOiI7Ozs7O1FBNklnQkEsVyxHQUFBQSxXO1FBc0hBQyxLLEdBQUFBLEs7O0FBOVBoQjs7QUFDQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7O0FBQ0E7O0FBQ0E7Ozs7QUFFQTs7QUFFQTs7O0FBaEJBOzs7OztBQW1CQSxJQUFNQyxVQUFVLGdCQUFLQyxTQUFMLEVBQWdCLFFBQWhCLENBQWhCOztBQUVBOzs7OztBQUtBLElBQU1DLGlCQUFpQix3QkFBVyxHQUFYLEVBQWdCLElBQWhCLENBQXZCOztBQUVBOzs7OztBQUtBQyxPQUFPQyx5QkFBUCxHQUFtQyxDQUFuQzs7QUFFQTs7Ozs7O0FBTUFELE9BQU9FLDRCQUFQLEdBQXNDLEVBQXRDOztBQUVBOzs7OztBQUtBLElBQU1DLGlCQUFpQixpREFBdkI7O0FBRUE7Ozs7Ozs7O0FBUUEsSUFBTUMsb0JBQW9CLFNBQXBCQSxpQkFBb0IsQ0FBQ0MsV0FBRCxFQUFjQyxRQUFkLEVBQTJCO0FBQ2pELFFBQU1DLE1BQU0sRUFBWjtBQUNBLFFBQUlDLFlBQVksSUFBaEI7QUFDQSxRQUFJQyxRQUFRLElBQVo7O0FBRUE7QUFDQTtBQUNBLFdBQU8sQ0FBQyxFQUFFQSxRQUFRTixlQUFlTyxJQUFmLENBQW9CTCxXQUFwQixDQUFWLENBQVIsRUFBcUQ7QUFDakQsWUFBTU0sYUFBYUYsTUFBTSxDQUFOLENBQW5CO0FBQ0EsWUFBSUcsVUFBVUQsV0FBV0UsT0FBWCxDQUFtQixlQUFuQixFQUFvQyxnQkFBUTtBQUN0RCxnQkFBSUMsSUFBSixFQUFVO0FBQ05BLHVCQUFPQSxLQUFLRCxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQixDQUFQO0FBQ0EsdUJBQU8sTUFBTUMsSUFBTixHQUFhLEdBQXBCO0FBQ0g7QUFDRCxtQkFBTyxFQUFQO0FBQ0gsU0FO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QUVEOzs7Ozs7O0FBT0EsUUFBTUMsV0FBVyxTQUFYQSxRQUFXLGNBQWU7QUFDNUIsWUFBSWpDLFlBQVlwQixNQUFoQixFQUF3QjtBQUNwQm9CLHdCQUFZTixPQUFaLENBQW9CLG1CQUFXO0FBQzNCcUMsdUJBQU9sQyxJQUFQLENBQVk7QUFDUkssMEJBQU1ELFFBQVFDLElBRE47QUFFUkMsOEJBQVVGLFFBQVFFO0FBRlYsaUJBQVo7QUFJSCxhQUxEO0FBTUg7QUFDRDZCO0FBQ0gsS0FWRDs7QUFZQSxXQUFPcEYsWUFBWWtGLEtBQUtJLE9BQWpCLEVBQTBCSixLQUFLNUIsSUFBL0IsRUFBcUNPLElBQXJDLENBQTBDd0IsUUFBMUMsRUFBb0RkLEtBQXBELENBQTBEYyxRQUExRCxDQUFQO0FBQ0giLCJmaWxlIjoiY2hlY2tlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGUgY2hlY2tlciDpkojlr7kgY3NzIOaWh+S7tueahOagoemqjOWZqFxuICogQGF1dGhvciBpZWxnbmF3KHd1amkwMjIzQGdtYWlsLmNvbSlcbiAqL1xuXG5pbXBvcnQge2pvaW59IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHtleGlzdHNTeW5jfSBmcm9tICdmcyc7XG5pbXBvcnQgY2hhbGsgZnJvbSAnY2hhbGsnO1xuaW1wb3J0IHBvc3Rjc3MgZnJvbSAncG9zdGNzcyc7XG5cbmltcG9ydCB7aXNJZ25vcmVkLCB0cmltLCBnZXRMaW5lQ29udGVudCwgY2hhbmdlQ29sb3JCeUluZGV4fSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHt1dGlsIGFzIGVkcFV0aWx9IGZyb20gJ2VkcC1jb3JlJztcbmltcG9ydCB7bG9hZENvbmZpZ30gZnJvbSAnLi9jb25maWcnO1xuXG4ndXNlIHN0cmljdCc7XG5cbi8qKlxuICogcnVsZSDpgLvovpHlrp7njrDnmoTmlofku7blpLnot6/lvoRcbiAqL1xuY29uc3QgcnVsZURpciA9IGpvaW4oX19kaXJuYW1lLCAnLi9ydWxlJyk7XG5cbi8qKlxuICog5qOA5rWL55qE6buY6K6k6YWN572uXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuY29uc3QgREVGQVVMVF9DT05GSUcgPSBsb2FkQ29uZmlnKCcuJywgdHJ1ZSk7XG5cbi8qKlxuICog5Li6IG1heC1lcnJvciDmnI3liqHnmoTvvIzorrDlvZXmlbTkuKrnmoTplJnor6/kuKrmlbBcbiAqXG4gKiBAdHlwZSB7bnVtYmVyfVxuICovXG5nbG9iYWwuQ1NTSElOVF9JTlZBTElEX0FMTF9DT1VOVCA9IDA7XG5cbi8qKlxuICog6K6w5b2V6aG555uu57qn5Yir55qEIGZvbnQtZmFtaWx5IOWkp+Wwj+WGmeS/oeaBr++8jGtleSDkuLrlsI/lhpnmoLzlvI/vvIx2YWx1ZSDkuLrnnJ/lrp7nmoTlgLxcbiAqIHsnYXJpYWwnOiAnQXJpYWwnfVxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbmdsb2JhbC5DU1NISU5UX0ZPTlRGQU1JTFlfQ0FTRV9GTEFHID0ge307XG5cbi8qKlxuICog5Yy56YWN6KGM5YaFIGNzc2hpbnQga2V5OiB2YWx1ZSwgLi4uIOeahOato+WImVxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmNvbnN0IElOTElORV9QQVRURVJOID0gL1xcL1xcKitcXHMqXFxiY3NzaGludFteLWRpc2FibGVdXFxiXFxzKiguKilcXHMqXFwqXFwvL2dtaTtcblxuLyoqXG4gKiDliIbmnpDooYzlhoXms6jph4pcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZUNvbnRlbnQg5b2T5YmN5qOA5rWL55qE5paH5Lu25YaF5a65XG4gKiBAcGFyYW0ge09iamVjdH0gcmNDb25maWcg5b2T5YmN5qOA5rWL55qE5paH5Lu255qE5qOA5rWL6KeE5YiZXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBpbmxpbmUgUnVsZVxuICovXG5jb25zdCBhbmFseXplSW5saW5lUnVsZSA9IChmaWxlQ29udGVudCwgcmNDb25maWcpID0+IHtcbiAgICBjb25zdCByZXQgPSB7fTtcbiAgICBsZXQgaW5saW5lT2JqID0gbnVsbDtcbiAgICBsZXQgbWF0Y2ggPSBudWxsO1xuXG4gICAgLyoganNoaW50IGxvb3BmdW5jOnRydWUgKi9cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1leHRyYS1ib29sZWFuLWNhc3QsIG5vLWxvb3AtZnVuYyAqL1xuICAgIHdoaWxlICghIShtYXRjaCA9IElOTElORV9QQVRURVJOLmV4ZWMoZmlsZUNvbnRlbnQpKSkge1xuICAgICAgICBjb25zdCBtYXRjaFJ1bGVzID0gbWF0Y2hbMV07XG4gICAgICAgIGxldCBqc29uU3RyID0gbWF0Y2hSdWxlcy5yZXBsYWNlKC8oW14sXSopKD89OikvZywgd29yZCA9PiB7XG4gICAgICAgICAgICBpZiAod29yZCkge1xuICAgICAgICAgICAgICAgIHdvcmQgPSB3b3JkLnJlcGxhY2UoL1xccy9nLCAnJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICdcIicgKyB3b3JkICsgJ1wiJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfSk7XG4gICAgICAgIGpzb25TdHIgPSAneycgKyBqc29uU3RyICsgJ30nO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpbmxpbmVPYmogPSBKU09OLnBhcnNlKGpzb25TdHIpO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7fVxuXG4gICAgICAgIGlmIChpbmxpbmVPYmopIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcCBpbiBpbmxpbmVPYmopIHtcbiAgICAgICAgICAgICAgICBpZiAocmNDb25maWcuaGFzT3duUHJvcGVydHkocCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0W3BdID0gaW5saW5lT2JqW3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWV4dHJhLWJvb2xlYW4tY2FzdCwgbm8tbG9vcC1mdW5jICovXG4gICAgcmV0dXJuIHJldDtcbn07XG5cbi8qKlxuICog5Yy56YWN6KGM5YaFIGNzc2hpbnQtZGlzYWJsZSB4eHgsIHl5eSwgenp6IOeahOato+WImVxuICpcbiAqIEB0eXBlIHtSZWdFeHB9XG4gKi9cbmNvbnN0IElOTElORV9ESVNBQkxFX1BBVFRFUk4gPSAvXFwvXFwqK1xccypcXGJjc3NoaW50XFwtZGlzYWJsZVxcYlxccyooW15cXCpcXC9dKilcXHMqXFwqXFwvL2dtaTtcblxuLyoqXG4gKiDliIbmnpDooYzlhoUgZGlzYWJsZSDms6jph4pcbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gZmlsZUNvbnRlbnQg5b2T5YmN5qOA5rWL55qE5paH5Lu25YaF5a65XG4gKiBAcGFyYW0ge09iamVjdH0gcmNDb25maWcg5b2T5YmN5qOA5rWL55qE5paH5Lu255qE5qOA5rWL6KeE5YiZXG4gKlxuICogQHJldHVybiB7T2JqZWN0fSBpbmxpbmUgUnVsZVxuICovXG5jb25zdCBhbmFseXplSW5saW5lRGlzYWJsZVJ1bGUgPSAoZmlsZUNvbnRlbnQsIHJjQ29uZmlnKSA9PiB7XG4gICAgY29uc3QgcmV0ID0ge307XG4gICAgbGV0IG1hdGNoID0gbnVsbDtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1leHRyYS1ib29sZWFuLWNhc3QgKi9cbiAgICB3aGlsZSAoISEobWF0Y2ggPSBJTkxJTkVfRElTQUJMRV9QQVRURVJOLmV4ZWMoZmlsZUNvbnRlbnQpKSkge1xuICAgICAgICBjb25zdCBtYXRjaGVkUnVsZXMgPSBtYXRjaFsxXTtcbiAgICAgICAgaWYgKG1hdGNoZWRSdWxlcykge1xuICAgICAgICAgICAgY29uc3Qgc2ltcGxlTWF0Y2hlZFJ1bGVzID0gbWF0Y2hlZFJ1bGVzLnNwbGl0KC9bXmEtei1dL2dtaSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gc2ltcGxlTWF0Y2hlZFJ1bGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgc2ltcGxlTWF0Y2hlZFJ1bGVzW2ldICYmIChyZXRbdHJpbShzaW1wbGVNYXRjaGVkUnVsZXNbaV0pXSA9IGZhbHNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcCBpbiByY0NvbmZpZykge1xuICAgICAgICAgICAgICAgIGlmIChyY0NvbmZpZy5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgICAgICAgICAgICAgICByZXRbcF0gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBuby1leHRyYS1ib29sZWFuLWNhc3QgKi9cbiAgICByZXR1cm4gcmV0O1xufTtcblxuLyoqXG4gKiDmo4DmtYsgY3NzIOaWh+S7tuWGheWuuVxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlQ29udGVudCDmlofku7blhoXlrrlcbiAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlUGF0aCDmlofku7bot6/lvoRcbiAqIEBwYXJhbSB7T2JqZWN0PX0gcmNDb25maWcg5qOA5rWL6KeE5YiZ55qE6YWN572u77yM5Y+v6YCJXG4gKlxuICogQHJldHVybiB7UHJvbWlzZX0gUHJvbWlzZSDlm57osIPlh73mlbDnmoTlj4LmlbDljbPplJnor6/kv6Hmga/nmoTpm4blkIgge3J1bGVOYW1lLCBsaW5lLCBjb2wsIGVycm9yQ2hhciwgbWVzc2FnZSwgY29sb3JNZXNzYWdlfVxuICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tTdHJpbmcoZmlsZUNvbnRlbnQsIGZpbGVQYXRoLCByY0NvbmZpZyA9IERFRkFVTFRfQ09ORklHKSB7XG5cbiAgICBnbG9iYWwuQ1NTSElOVF9GT05URkFNSUxZX0NBU0VfRkxBRyA9IHt9O1xuXG4gICAgLy8g6L+Z6YeM5oqK5paH5Lu25YaF5a6555qEIFxcclxcbiDnu5/kuIDmm7/mjaLmiJAgXFxu77yM5L6/5LqO5LmL5ZCO6I635Y+W6KGM5Y+3XG4gICAgZmlsZUNvbnRlbnQgPSBmaWxlQ29udGVudC5yZXBsYWNlKC9cXHJcXG4/L2csICdcXG4nKTtcblxuICAgIC8vIOihjOWGheazqOmHiuaUueWPmOinhOWImemFjee9rlxuICAgIGNvbnN0IGlubGluZSA9IGFuYWx5emVJbmxpbmVSdWxlKGZpbGVDb250ZW50LCByY0NvbmZpZyk7XG5cbiAgICAvLyDooYzlhoXms6jph4rlj5bmtojop4TliJnphY3nva5cbiAgICBjb25zdCBpbmxpbmVEaXNhYmxlID0gYW5hbHl6ZUlubGluZURpc2FibGVSdWxlKGZpbGVDb250ZW50LCByY0NvbmZpZyk7XG5cbiAgICBjb25zdCByZWFsQ29uZmlnID0gZWRwVXRpbC5leHRlbmQoe30sIHJjQ29uZmlnLCBpbmxpbmUsIGlubGluZURpc2FibGUpO1xuXG4gICAgbGV0IG1heEVycm9yID0gcGFyc2VJbnQocmVhbENvbmZpZ1snbWF4LWVycm9yJ10sIDEwKTtcblxuICAgIC8vIG1heEVycm9yIOS4uiAwIOaIluiAhemdnuaVsOWtl+eahOaDheWGte+8jOWImeihqOekuuW/veeVpSBtYXhFcnJvciDljbPmmK/mnIDlpKflgLxcbiAgICBpZiAoaXNOYU4obWF4RXJyb3IpIHx8IG1heEVycm9yID09PSAwKSB7XG4gICAgICAgIG1heEVycm9yID0gTnVtYmVyLk1BWF9WQUxVRTtcbiAgICB9XG5cbiAgICAvLyBwb3N0Y3NzIOaPkuS7tumbhuWQiOWNs+inhOWImeajgOa1i+eahOaWh+S7tumbhuWQiFxuICAgIGNvbnN0IHBsdWdpbnMgPSBbXTtcblxuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKFxuICAgICAgICByZWFsQ29uZmlnXG4gICAgKS5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICB2YXIgcnVsZUZpbGVQYXRoID0gam9pbihydWxlRGlyLCBwcm9wKSArICcuanMnO1xuICAgICAgICBpZiAoZXhpc3RzU3luYyhydWxlRmlsZVBhdGgpKSB7XG4gICAgICAgICAgICBwbHVnaW5zLnB1c2goXG4gICAgICAgICAgICAgICAgcmVxdWlyZShqb2luKHJ1bGVEaXIsIHByb3ApKS5jaGVjayh7XG4gICAgICAgICAgICAgICAgICAgIHJ1bGVWYWw6IHJlYWxDb25maWdbcHJvcF0sXG4gICAgICAgICAgICAgICAgICAgIC8vIOWunumZheS4iuWcqCBwb3N0Y3NzIOeahCBwbHVnaW4g6YeM6Z2i6YCa6L+HIG5vZGUuc291cmNlLmlucHV0LmNzcyDkuZ/lj6/ku6Xmi7/liLDmlofku7blhoXlrrlcbiAgICAgICAgICAgICAgICAgICAgLy8g5L2G5piv6YCa6L+H6L+Z56eN5pa55byP5ou/5Yiw55qE5YaF5a655piv5Y675o6JIEJPTSDnmoTvvIzlm6DmraTlnKjmo4DmtYsgbm8tYm9tIOinhOWImeaXtuWAmeS8muaciemXrumimFxuICAgICAgICAgICAgICAgICAgICAvLyDmiYDku6Xov5nph4zmiormlofku7bnmoTljp/lhoXlrrnkvKDlhaXov5vljrtcbiAgICAgICAgICAgICAgICAgICAgZmlsZUNvbnRlbnQ6IGZpbGVDb250ZW50LFxuICAgICAgICAgICAgICAgICAgICBmaWxlUGF0aDogZmlsZVBhdGgsXG4gICAgICAgICAgICAgICAgICAgIG1heEVycm9yOiBtYXhFcnJvclxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyDkuI3lkIjms5XnmoTkv6Hmga/pm4blkIhcbiAgICBjb25zdCBpbnZhbGlkTGlzdCA9IFtdO1xuXG4gICAgY29uc3QgaW52YWxpZCA9IHtcbiAgICAgICAgcGF0aDogJycsXG4gICAgICAgIG1lc3NhZ2VzOiBbXVxuICAgIH07XG5cbiAgICBjb25zdCBjaGVja1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHBvc3Rjc3MocGx1Z2lucykucHJvY2VzcyhmaWxlQ29udGVudCkudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgcmVzdWx0Lndhcm5pbmdzKCkuZm9yRWFjaChkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBpbnZhbGlkLm1lc3NhZ2VzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBydWxlTmFtZTogZGF0YS5ydWxlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbGluZTogZGF0YS5saW5lLFxuICAgICAgICAgICAgICAgICAgICBjb2w6IGRhdGEuY29sLFxuICAgICAgICAgICAgICAgICAgICBlcnJvckNoYXI6IGRhdGEuZXJyb3JDaGFyIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiBkYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yTWVzc2FnZTogZGF0YS5jb2xvck1lc3NhZ2VcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoaW52YWxpZC5wYXRoICE9PSBmaWxlUGF0aCkge1xuICAgICAgICAgICAgICAgICAgICBpbnZhbGlkLnBhdGggPSBmaWxlUGF0aDtcbiAgICAgICAgICAgICAgICAgICAgaW52YWxpZExpc3QucHVzaChpbnZhbGlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc29sdmUoaW52YWxpZExpc3QpO1xuICAgICAgICB9KS5jYXRjaChlID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdlOiAnLCBlKTtcbiAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBlLmxpbmU7XG4gICAgICAgICAgICAvLyDmoLnmja4gbGluZSDmmK/lkKblrZjlnKjmnaXliKTmlq3mmK8gY3NzIHBhcnNlIOeahOmUmeivr+i/mOaYr+eoi+W6j+eahOmUmeivr1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICAgIGlmIChsaW5lKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmVDb250ZW50ID0gZ2V0TGluZUNvbnRlbnQoZS5saW5lLCBmaWxlQ29udGVudCkgfHwgJyc7XG4gICAgICAgICAgICAgICAgaW52YWxpZC5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbGluZTogZS5saW5lLFxuICAgICAgICAgICAgICAgICAgICBjb2w6IGUuY29sdW1uLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgKyAnQ3NzU3ludGF4RXJyb3I6ICdcbiAgICAgICAgICAgICAgICAgICAgICAgICsgZS5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgICBjb2xvck1lc3NhZ2U6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICArIGNoYWxrLnJlZCgnQ3NzU3ludGF4RXJyb3IgPCcgKyBlLnJlYXNvbiArICc+OiAnKVxuICAgICAgICAgICAgICAgICAgICAgICAgKyBjaGFsay5ncmV5KFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZUNvbG9yQnlJbmRleChsaW5lQ29udGVudCwgMCwgbGluZUNvbnRlbnQuc3Vic3RyaW5nKDAsIGUuY29sdW1uIC0gMSkpXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHIgPSBlLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICAgICAgaW52YWxpZC5tZXNzYWdlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogc3RyLFxuICAgICAgICAgICAgICAgICAgICBjb2xvck1lc3NhZ2U6IGNoYWxrLnJlZChzdHIpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChpbnZhbGlkLnBhdGggIT09IGZpbGVQYXRoKSB7XG4gICAgICAgICAgICAgICAgaW52YWxpZC5wYXRoID0gZmlsZVBhdGg7XG4gICAgICAgICAgICAgICAgaW52YWxpZExpc3QucHVzaChpbnZhbGlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVqZWN0KGludmFsaWRMaXN0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gY2hlY2tQcm9taXNlO1xufVxuXG4vKipcbiAqIOagoemqjOaWh+S7tlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBmaWxlIOWMheWQqyBwYXRoLCBjb250ZW50IOmUrueahOWvueixoVxuICogQHBhcmFtIHtBcnJheX0gZXJyb3JzIOacrOWIhuexu+eahOmUmeivr+S/oeaBr+aVsOe7hFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZG9uZSDmoKHpqozlrozmiJDnmoTpgJrnn6Xlm57osINcbiAqXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gY2hlY2tTdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrKGZpbGUsIGVycm9ycywgZG9uZSkge1xuICAgIC8vIC5jc3NoaW50aWdub3JlIOS4remFjee9rueahOaWh+S7tuaYr+aMh+WPr+S7peW/veeVpSBjc3NoaW50IOeahOaWh+S7tlxuICAgIGlmIChpc0lnbm9yZWQoZmlsZS5wYXRoLCAnLmNzc2hpbnRpZ25vcmUnKSkge1xuICAgICAgICBkb25lKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjaGVja1N0cmluZyDnmoQgcHJvbWlzZSDnmoQgcmVqZWN0IOWSjCByZXNvbHZlIOeahOi/lOWbnuWAvOeahOe7k+aehOS7peWPiuWkhOeQhuaWueW8j+mDveaYr+S4gOagt+eahFxuICAgICAqIHJlamVjdCDmjIfnmoTmmK8gQ3NzU3ludGF4RXJyb3Ig55qE6ZSZ6K+v44CCXG4gICAgICogcmVzb2x2ZSDku6PooajnmoTmmK8gY3NzaGludCDmo4DmtYvlh7rmnaXnmoTpl67pophcbiAgICAgKlxuICAgICAqIEBwYXJhbSB7QXJyYXkuPE9iamVjdD59IGludmFsaWRMaXN0IOmUmeivr+S/oeaBr+mbhuWQiFxuICAgICAqL1xuICAgIGNvbnN0IGNhbGxiYWNrID0gaW52YWxpZExpc3QgPT4ge1xuICAgICAgICBpZiAoaW52YWxpZExpc3QubGVuZ3RoKSB7XG4gICAgICAgICAgICBpbnZhbGlkTGlzdC5mb3JFYWNoKGludmFsaWQgPT4ge1xuICAgICAgICAgICAgICAgIGVycm9ycy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogaW52YWxpZC5wYXRoLFxuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlczogaW52YWxpZC5tZXNzYWdlc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZG9uZSgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gY2hlY2tTdHJpbmcoZmlsZS5jb250ZW50LCBmaWxlLnBhdGgpLnRoZW4oY2FsbGJhY2spLmNhdGNoKGNhbGxiYWNrKTtcbn07XG4iXX0=