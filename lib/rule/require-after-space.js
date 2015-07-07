/**
 * @file require-after-space 的检测逻辑
 *       `:` 对应 004: [强制] `属性名` 与之后的 `:` 之间不允许包含空格， `:` 与 `属性值` 之间必须包含空格。
 *       `,` 对应 005: [强制] `列表型属性值` 书写在单行时，`,` 后必须跟一个空格。
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
var RULENAME = 'require-after-space';

/**
 * 冒号
 *
 * @type {string}
 */
var COLON = ':';

/**
 * 逗号
 *
 * @type {string}
 */
var COMMA = ',';

/**
 * 匹配 css 属性值的 url(...);
 *
 * @type {RegExp}
 */
var PATTERN_URI = /url\(["']?([^\)"']+)["']?\)/i;

/**
 * 冒号的错误信息
 *
 * @type {string}
 */
var COLON_MSG = ''
    + 'Disallow contain spaces between the `attr-name` and `:`, '
    + 'Must contain spaces between `:` and `attr-value`';

/**
 * 逗号的错误信息
 *
 * @type {string}
 */
var COMMA_MSG = 'Must contain spaces after `,` in `attr-value`';

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

                var source = decl.source;
                var line = source.start.line;
                var lineContent = util.getLineContent(line, source.input.css) || '';

                if (realRuleVal.indexOf(COLON) !== -1) {
                    var between = decl.between;

                    if (between.slice(0, 1) !== ':' // `属性名` 与之后的 `:` 之间包含空格了
                        || between.slice(-1) === ':' // `:` 与 `属性值` 之间不包含空格
                    ) {
                        // var col = source.end.column - decl.value.length;
                        var colorStr = decl.prop + decl.between + decl.value;
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            errorChar: COLON,
                            line: line,
                            // col: col,
                            message: COLON_MSG,
                            colorMessage: '`'
                                + lineContent.replace(
                                    colorStr,
                                    chalk.magenta(colorStr)
                                )
                                + '` '
                                + chalk.grey(COLON_MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }

                if (realRuleVal.indexOf(COMMA) !== -1) {

                    var value = decl.value;

                    // 排除掉 uri 的情况，例如
                    // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                    // background-image: 2px 2px url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...);
                    // background-image: url(data:image/gif;base64,R0lGODlhCAAHAIABAGZmZv...) 2px 2px;
                    if (!PATTERN_URI.test(value)) {

                        // var col = source.end.column - decl.value.length;
                        var items = lineContent.split(';');
                        for (var j = 0, jLen = items.length; j < jLen; j++) {
                            var s = items[j];
                            if (s.indexOf(',') > -1
                                && /.*,(?!\s)/.test(s)
                                && s.length !== lineContent.length // s.length === lineContent.length 的情况表示当前行结束了
                            ) {
                                result.warn(RULENAME, {
                                    node: decl,
                                    ruleName: RULENAME,
                                    errorChar: COMMA,
                                    line: line,
                                    // col: col,
                                    message: COMMA_MSG,
                                    colorMessage: '`'
                                        // + lineContent.replace(s, chalk.magenta(s))
                                        + lineContent.replace(
                                            value,
                                            chalk.magenta(value)
                                        )
                                        + '` '
                                        + chalk.grey(COMMA_MSG)
                                });
                                global.CSSHINT_INVALID_ALL_COUNT++;
                            }
                        }
                    }
                }

            });
        }
    };
});
