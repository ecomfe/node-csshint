/**
 * @file checker 针对 css 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var parserlib = require('parserlib');
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
 * @param {Object=} rcConfig 检测规则的配置，可选
 *
 * @return {Array.<Object>} 错误信息的集合 {ruleName, line, col, errorChar, message, colorMessage}
 */
exports.checkString = function (fileContent, rcConfig) {

    // 如果 rcConfig 不存在，则用默认的配置，单独作为模块调用时用到
    rcConfig = rcConfig || defaultConfig;

    var invalidList = [];

    // 每个文件都使用一个新的 parser 对象，避免 addListener 多次
    var parser = new parserlib.css.Parser({
        starHack: true,         // 允许 * hack
        ieFilters: true,        // ie < 8 允许 filter properties
        underscoreHack: true,   // 允许 _ hack
        strict: false           // 为 true 时则 parserlib 的 error recovery 不可用
                                // 并且首次出现语法错误时就终止
    });

    Object.getOwnPropertyNames(
        rcConfig
    ).forEach(
        function (prop) {
            var ruleFilePath = path.join(ruleDir, prop) + '.js';
            if (fs.existsSync(ruleFilePath)) {
                require(path.join(ruleDir, prop))(
                    parser,
                    fileContent,
                    prop,
                    rcConfig[prop],
                    invalidList
                );
            }
        }
    );

    // 首先检测 syntax errors
    parser.addListener(
        'error',
        function (ex) {
            invalidList.push({
                line: ex.line,
                col: ex.col,
                message: '`'
                    + 'CSS Parse Error: '
                    + (ex.type
                        ? 'type: ' + ex.type
                        : '')
                    + '` '
                    + ex.message,
                colorMessage: '`'
                    + chalk.red('CSS Parse Error: ')
                    + (ex.type
                        ? 'type: ' + chalk.red(ex.type)
                        : '')
                    + '` '
                    + chalk.grey(ex.message)
            });
        }
    );

    try {
        parser.parse(fileContent);
    }
    catch (ex) {
        invalidList.push({
            line: ex.line,
            col: ex.col,
            message: '`'
                + 'CSS Parse Fatal Error: '
                + (ex.type
                    ? 'type: ' + ex.type
                    : '')
                + '` '
                + ex.message,
            colorMessage: '`'
                + chalk.red('CSS Parse Fatal Error: ')
                + (ex.type
                    ? 'type: ' + chalk.red(ex.type)
                    : '')
                + '` '
                + chalk.grey(ex.message)
        });
    }

    var maxErrorCount = rcConfig['max-error'];
    if (maxErrorCount && !isNaN(maxErrorCount)
            && (invalidList.length > maxErrorCount)
    ) {
        invalidList = [];
        invalidList.push({
            ruleName: 'max-error',
            message: 'Too much warns in currently file',
            colorMessage: chalk.bold.red('Too much warns in currently file')
        });
    }

    return invalidList;
};

/**
 * 校验文件
 *
 * @param {Object} file 包含 path, content 键的对象
 * @param {Array} errors 本分类的错误信息数组
 * @param {Function} done 校验完成的通知回调
 */
exports.check = function (file, errors, done) {
    var me = this;

    // .csshintignore 中配置的文件是指可以忽略 csshint 的文件
    if (util.isIgnored(file.path, '.csshintignore')) {
        done();
        return;
    }

    // .csshintrc 中的配置项指的对建议的规则是否开启 csshint
    var rcConfig = util.getConfig('.csshintrc', file.path, defaultConfig);

    var invalidList = me.checkString(file.content, rcConfig);

    if (invalidList.length) {
        errors.push({
            path: file.path,
            messages: invalidList
        });
    }

    done();
};
