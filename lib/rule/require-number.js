/**
 * @file require-number 的检测逻辑
 *       `font-weight` 对应 039: [强制] `font-weight` 属性必须使用数值方式描述。
 *       `line-height` 对应 040: [建议] `line-height` 在定义文本段落时，应使用数值。
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
var RULENAME = 'require-number';

var PATTERN_NUMERIC = /^\d*[\.\d%]*$/;

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = ' must be a number value';

var arrayProto = Array.prototype;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {

        var ruleVal = opts.ruleVal;
        var realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {

            css.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                var prop = decl.prop;

                if (realRuleVal.indexOf(prop) !== -1) {
                    if (!PATTERN_NUMERIC.test(decl.value)) {
                        var source = decl.source;
                        var line = source.start.line;
                        var lineContent = util.getLineContent(line, source.input.css);
                        var col = source.start.column + decl.prop.length + decl.between.length;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            errorChar: prop,
                            line: line,
                            col: col,
                            message: prop + msg,
                            colorMessage: '`'
                                + util.changeColorByStartAndEndIndex(
                                    lineContent, col, source.end.column
                                )
                                + '` '
                                + chalk.grey(prop + msg)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }

            });
        }
    };
});
