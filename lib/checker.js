/**
 * @file checker 针对 css 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
// var edp = require('edp-core');

var postcss = require('postcss');
var Q = require('q');

var util = require('./util');

/**
 * css 检测的默认配置
 * http://gitlab.baidu.com/fe/spec/blob/master/css.md
 *
 * @type {Object}
 */
var defaultConfig = require('./config');

/**
 * rule 逻辑实现的文件夹路径
 */
var ruleDir = path.join(__dirname, './rule');

/**
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 * @param {string} filePath 文件路径
 * @param {Object=} rcConfig 检测规则的配置，可选
 *
 * @return {Array.<Object>} 错误信息的集合 {ruleName, line, col, errorChar, message, colorMessage}
 */
exports.checkString = function (fileContent, filePath, rcConfig) {

    // 如果 rcConfig 不存在，则用默认的配置，单独作为模块调用时用到
    rcConfig = rcConfig || defaultConfig;

    // 把文件的换行分隔符统一换成 \n
    fileContent = fileContent.replace(/\r\n?/g, '\n');

    // 不合法的信息集合
    var invalidList = [];

    // postcss 插件集合即规则检测的文件集合
    var plugins = [];

    Object.getOwnPropertyNames(
        rcConfig
    ).forEach(
        function (prop) {
            var ruleFilePath = path.join(ruleDir, prop) + '.js';
            if (fs.existsSync(ruleFilePath)) {
                plugins.push(require(path.join(ruleDir, prop))({ruleVal: rcConfig[prop]}));
            }
        }
    );

    var deferred = Q.defer();

    var invalid = {
        path: '',
        messages: []
    };

    postcss(plugins).process(fileContent).then(function (result) {
        result.warnings().forEach(function (data) {
            invalid.messages.push({
                ruleName: data.ruleName,
                line: data.line,
                col: data.col,
                message: data.message,
                colorMessage: data.colorMessage
            });
            if (invalid.path !== filePath) {
                invalid.path = filePath;
                invalidList.push(invalid);
            }
        });

        deferred.resolve(invalidList);
    }).catch(function (e) {

        var line = e.line;
        // 根据 line 是否存在来判断是 css parse 的错误还是程序的错误
        if (line) {
            var lineContent = util.getLineContent(e.line, fileContent) || '';
            invalid.messages.push({
                line: e.line,
                col: e.column,
                message: ''
                    + 'CssSyntaxError: '
                    + e.message,
                colorMessage: ''
                    + chalk.red('CssSyntaxError <' + e.reason + '>: ')
                    + chalk.grey(
                        util.changeColorByIndex(lineContent, 0, lineContent.substring(0, e.column - 1))
                    )
            });
        }
        else {
            var str = e.toString();
            invalid.messages.push({
                message: str,
                colorMessage: chalk.red(str)
            });
        }

        if (invalid.path !== filePath) {
            invalid.path = filePath;
            invalidList.push(invalid);
        }
        deferred.reject(invalidList);
    });

    return deferred.promise;
};

/**
 * 校验文件
 *
 * @param {Object} file 包含 path, content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    // .csshintignore 中配置的文件是指可以忽略 csshint 的文件
    if (util.isIgnored(file.path, '.csshintignore')) {
        done();
        return;
    }

    // .csshintrc 中的配置项指的对建议的规则是否开启 csshint
    var rcConfig = util.getConfig('.csshintrc', file.path, defaultConfig);

    /**
     * checkString 的 promise 的 reject 和 resolve 的返回值的结构以及处理方式都是一样的
     * reject 指的是 CssSyntaxError 的错误。
     * resolve 代表的是 csshint 检测出来的问题
     *
     * @param {Array.<Object>} invalidList 错误信息集合
     */
    var thenFunc = function (invalidList) {
        // console.warn(require('util').inspect(invalidList, { showHidden: true, depth: null }));
        // console.warn(invalidList);
        // console.warn();
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

    exports.checkString(file.content, file.path, rcConfig).then(thenFunc, thenFunc);

    // var invalidList = exports.checkString(file.content, rcConfig);

    // if (invalidList.length) {
    //     errors.push({
    //         path: file.path,
    //         messages: invalidList
    //     });
    // }

    // done();
};


/**
 * 匹配行内 csshint-disable xxx, yyy, zzz 的正则
 *
 * @type {RegExp}
 */
// var DISABLE_INLINE_PATTERN = /\/\*+\s*\bcsshint\-disable\b\s*(.*)\s*\*\//gmi;

/**
 * 分析行内注释
 *
 * @param {string} fileContent 当前检测的文件内容
 * @param {Object} rcConfig 当前检测的文件的检测规则
 *
 * @return {Object} inline Rule
 */
// function analyzeInlineRule(fileContent, rcConfig) {
//     var ret = {};
//     var match = null;
//     /* eslint-disable no-extra-boolean-cast */
//     while (!!(match = DISABLE_INLINE_PATTERN.exec(fileContent))) {
//         var matchedRules = match[1];
//         if (matchedRules) {
//             // matchedRules = matchedRules.split(',');
//             matchedRules = matchedRules.split(/[^a-z-]/gmi);
//             for (var i = 0, len = matchedRules.length; i < len; i++) {
//                 ret[util.trim(matchedRules[i])] = false;
//             }
//         }
//     }
//     /* eslint-enable no-extra-boolean-cast */
//     return ret;
// }
