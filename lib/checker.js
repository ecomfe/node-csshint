/**
 * @file checker 针对 css 文件的校验器
 * @author ielgnaw(wuji0223@gmail.com)
 */

var util = require('./util');

var chalk = require('chalk');

var parserlib = require('parserlib');

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
 * Parser 的实例，这里的配置写死，允许 starHack, ieFilters, underscoreHack
 *
 * @type {Object}
 */
var parser = new parserlib.css.Parser({
    starHack: true,         // 允许 * hack
    ieFilters: true,        // ie < 8 允许 filter properties
    underscoreHack: true,   // 允许 _ hack
    strict: false           // 为 true 时则 parserlib 的 error recovery 不可用
                            // 并且首次出现语法错误时就终止
});

/**
 * 检测 css 文件内容
 *
 * @param {string} fileContent 文件内容
 *
 * @return {Array.<Object>} 错误信息的集合 {line, col, message}
 */
exports.checkString = function (fileContent) {
    var invalidList = [];
    parser.addListener('startrule', function(event){
        var selectors = event.selectors,
            selector,
            part,
            modifier,
            classCount,
            i, j, k;

        for (i=0; i < selectors.length; i++){
            selector = selectors[i];
            for (j=0; j < selector.parts.length; j++){
                part = selector.parts[j];
                if (part.type == parser.SELECTOR_PART_TYPE){
                    classCount = 0;
                    for (k=0; k < part.modifiers.length; k++){
                        modifier = part.modifiers[k];
                        if (modifier.type == 'class'){
                            classCount++;
                        }
                        if (classCount > 1){
                            var lineContent = util.getLineContent(part.line, fileContent);
                            console.log(lineContent.replace(
                                lineContent.slice(0, part.col + 1),
                                chalk.magenta(lineContent.slice(0, part.col + 1))
                            ))
                            invalidList.push({
                                line: part.line,
                                col: part.col,
                                message: '`'
                                    + lineContent.replace(
                                        lineContent.slice(0, part.col + 1),
                                        chalk.magenta(lineContent.slice(0, part.col + 1))
                                    )
                                    + '` '
                                    + chalk.grey('Don\'t use adjoining classes.')
                            });
                        }
                    }
                }
            }
        }

    });

    try {
        parser.parse(fileContent);
    } catch (ex) {
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
