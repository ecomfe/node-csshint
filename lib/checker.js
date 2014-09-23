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
 * http://gitlab.baidu.com/fe/spec/blob/master/css.md 规范中强制的规则不在配置之内
 * 强制的是必须要满足的
 * 这里的配置指的是规范中建议的规则
 *
 * @type {Object}
 */
var defaultConfig = require('./config');

/**
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 *
 * @return {Array.<Object>} 错误信息的集合 {line, col, message}
 */
exports.checkString = function (fileContent) {

    // 每个文件都使用一个新的 parser 对象，避免 addListener 多次
    var parser = new parserlib.css.Parser({
        starHack: true,         // 允许 * hack
        ieFilters: true,        // ie < 8 允许 filter properties
        underscoreHack: true,   // 允许 _ hack
        strict: false           // 为 true 时则 parserlib 的 error recovery 不可用
                                // 并且首次出现语法错误时就终止
    });

    var invalidList = [];

    fs.readdirSync(
        path.join(__dirname, '../hint')
    ).forEach(
        function (fileName) {
            fileName = fileName.replace(/\.js$/, '');
            require(path.join(__dirname, '../hint', fileName))(
                parser,
                fileContent,
                invalidList
            );
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
                + chalk.red('CSS Parse Fatal Error: ')
                + (ex.type
                    ? 'type: ' + chalk.red(ex.type)
                    : '')
                + '` '
                + chalk.grey(ex.message)
        });
    }

    return invalidList;
};

/**
 * 校验文件
 *
 * @param {Object} file 包含 path 和 content 键的对象
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
    // console.warn(rcConfig);

    var fileContent = file.content;
    var invalidList = me.checkString(fileContent);
    if (invalidList.length) {
        errors.push({
            path: file.path,
            messages: invalidList
        });
    }

    done();
};
