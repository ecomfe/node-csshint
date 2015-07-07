/**
 * @file checker 针对 css 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var edp = require('edp-core');
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
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 * @param {string} filePath 文件路径
 * @param {Object=} rcConfig 检测规则的配置，可选
 *
 * @return {Promise} Promise 回调函数的参数即错误信息的集合 {ruleName, line, col, errorChar, message, colorMessage}
 */
exports.checkString = function (fileContent, filePath, rcConfig) {

    // 如果 rcConfig 不存在，则用默认的配置，单独作为模块调用时用到
    rcConfig = rcConfig || defaultConfig;

    // 把文件的换行分隔符统一换成 \n
    fileContent = fileContent.replace(/\r\n?/g, '\n');

    // 行内注释改变规则配置
    var inline = analyzeInlineRule(fileContent, rcConfig);

    // 行内注释取消规则配置
    var inlineDisable = analyzeInlineDisableRule(fileContent, rcConfig);

    var realConfig = edp.util.extend({}, rcConfig, inline, inlineDisable);

    var maxError = parseInt(realConfig['max-error'], 10);

    // maxError 为 0 或者非数字的情况，则表示忽略 maxError 即是最大值
    if (isNaN(maxError) || maxError === 0) {
        maxError = Number.MAX_VALUE;
    }

    // postcss 插件集合即规则检测的文件集合
    var plugins = [];

    Object.getOwnPropertyNames(
        realConfig
    ).forEach(
        function (prop) {
            var ruleFilePath = path.join(ruleDir, prop) + '.js';
            if (fs.existsSync(ruleFilePath)) {
                plugins.push(
                    require(path.join(ruleDir, prop))({
                        ruleVal: realConfig[prop],

                        // 实际上在 postcss 的 plugin 里面通过 node.source.input.css 也可以拿到文件内容
                        // 但是通过这种方式拿到的内容是去掉 BOM 的，因此在检测 no-bom 规则时候会有问题
                        // 所以这里把文件的原内容传入进去
                        fileContent: fileContent,
                        maxError: maxError
                    })
                );
            }
        }
    );


    var deferred = Q.defer();

    // 不合法的信息集合
    var invalidList = [];

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
                errorChar: data.errorChar || '',
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
        /* istanbul ignore else */
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
 *
 * @return {Function} checkString
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

    return exports.checkString(file.content, file.path, rcConfig).then(thenFunc, thenFunc);
};

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
function analyzeInlineRule(fileContent, rcConfig) {
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
        }
        catch (e) {}

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
}

/**
 * 匹配行内 csshint-disable xxx, yyy, zzz 的正则
 *
 * @type {RegExp}
 */
// var INLINE_DISABLE_PATTERN = /\/\*+\s*\bcsshint\-disable\b\s*(.*)\s*\*\//gmi;
var INLINE_DISABLE_PATTERN = /\/\*+\s*\bcsshint\-disable\b\s*([^\*\/]*)\s*\*\//gmi;

/**
 * 分析行内 disable 注释
 *
 * @param {string} fileContent 当前检测的文件内容
 * @param {Object} rcConfig 当前检测的文件的检测规则
 *
 * @return {Object} inline Rule
 */
function analyzeInlineDisableRule(fileContent, rcConfig) {
    var ret = {};
    var match = null;
    /* eslint-disable no-extra-boolean-cast */
    while (!!(match = INLINE_DISABLE_PATTERN.exec(fileContent))) {
        var matchedRules = match[1];
        if (matchedRules) {
            var simpleMatchedRules = matchedRules.split(/[^a-z-]/gmi);
            for (var i = 0, len = simpleMatchedRules.length; i < len; i++) {
                simpleMatchedRules[i] && (ret[util.trim(simpleMatchedRules[i])] = false);
            }
        }
        else {
            for (var p in rcConfig) {
                if (rcConfig.hasOwnProperty(p)) {
                    ret[p] = false;
                }
            }
        }
    }
    /* eslint-enable no-extra-boolean-cast */
    return ret;
}
