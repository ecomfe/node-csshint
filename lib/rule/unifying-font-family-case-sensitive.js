/**
 * @file unifying-font-family-case-sensitive 的检测逻辑
 *       036: [强制] `font-family` 不区分大小写，但在同一个项目中，同样的 `Family Name` 大小写必须统一。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');
var chalk = require('chalk');

var util = require('../util');

/**
 * 当前文件所代表的规则名称
 *
 * @type {string}
 */
var RULENAME = 'unifying-font-family-case-sensitive';

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = '`font-family` case insensitive, but in the same project, the same` Family Name` case must be unified.';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (!opts.ruleVal) {
            return;
        }

        css.eachDecl(function (decl) {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }

            var prop = decl.prop;

            if (prop === 'font-family') {
                var parts = postcss.list.space(decl.value);
                for (var i = 0, len = parts.length; i < len; i++) {
                    var part = parts[i].replace(/['",]/g, '');
                    var partLowerCase = part.toLowerCase();

                    if (!global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase]) {
                        global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase] = part;
                    }
                    else {
                        if (global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase] !== part) {
                            var source = decl.source;
                            var line = source.start.line;
                            var lineContent = util.getLineContent(line, source.input.css);
                            var col = lineContent.indexOf(part) + 1;// + decl.prop.length + decl.between.length;

                            var m = getMsg(part, global.CSSHINT_FONTFAMILY_CASE_FLAG[partLowerCase]);

                            result.warn(RULENAME, {
                                node: decl,
                                ruleName: RULENAME,
                                line: line,
                                col: col,
                                message: m.msg,
                                colorMessage: '`'
                                    + lineContent.replace(part, chalk.magenta(part))
                                    + '` '
                                    + chalk.grey(m.colorMsg)
                            });
                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }
                }
            }
        });
    };
});

/**
 * 获取错误信息
 *
 * @param {string} curFontFamily 当前检测的这个 font-family 值
 * @param {string} projFontFamily 项目级别对应的这个 font-family 值
 *
 * @return {Object} 错误信息
 */
function getMsg(curFontFamily, projFontFamily) {
    return {
        msg: msg
            + ' In currently project, '
            + '`'
            + curFontFamily
            + '` should be `'
            +   projFontFamily
            + '`.',
        colorMsg: msg
            + ' In currently project, '
            + '`'
            + chalk.magenta(curFontFamily)
            + '` should be `'
            + chalk.magenta(projFontFamily)
            + '`.'
    };
}
