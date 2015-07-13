/**
 * @file bulletproof-font-face 的检测逻辑
 *       Rule: Use the bulletproof @font-face syntax to avoid 404's in old IE
 *       (http://www.fontspring.com/blog/the-new-bulletproof-font-face-syntax)
 *       https://github.com/CSSLint/csslint/wiki/Bulletproof-font-face
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
var RULENAME = 'bulletproof-font-face';

var PATTERN = /^\s?url\(['"].+\.eot\?.*['"]\)\s*format\(['"]embedded-opentype['"]\)[\s\S]*$/i;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = '@font-face declaration doesn\'t follow the fontspring bulletproof syntax';

var firstSrc = true;
var failedDecl = false;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        if (opts.ruleVal) {

            css.eachAtRule(function (atRule) {
                if (atRule.name !== 'font-face') {
                    return;
                }

                firstSrc = true;
                failedDecl = false;

                atRule.eachDecl(function (decl) {
                    if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                        return;
                    }

                    var prop = decl.prop;
                    var value = decl.value;

                    if (prop === 'src') {
                        if (!value.match(PATTERN) && firstSrc) {
                            failedDecl = decl;
                            firstSrc = false;
                        }
                        else if (value.match(PATTERN) && !firstSrc) {
                            failedDecl = false;
                        }
                    }
                });

                if (failedDecl) {
                    var source = failedDecl.source;
                    var line = source.start.line;
                    var lineContent = util.getLineContent(line, source.input.css);
                    var col = source.start.column;
                    result.warn(RULENAME, {
                        node: atRule,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + util.changeColorByStartAndEndIndex(
                                lineContent, col, source.end.column
                            )
                            + '` '
                            + chalk.grey(msg)
                    });

                    global.CSSHINT_INVALID_ALL_COUNT++;
                }

            });
        }
    };
});
