/**
 * @file shorthand 的检测逻辑
 *       `property` 对应 015: [建议] 在可以使用缩写的情况下，尽量使用属性缩写。
 *       `color` 对应 030: [强制] 颜色值可以缩写时，必须使用缩写形式。
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
var RULENAME = 'shorthand';

/**
 * 匹配 #aaccaa 之类的颜色值
 *
 * @type {RegExp}
 */
var PATTERN_COLOR = /^#([\da-f])\1([\da-f])\2([\da-f])\3$/i;

/**
 * 错误的信息
 *
 * @type {string}
 */
var colorMsg = 'Color value can be abbreviated, must use the abbreviation form';

var arrayProto = Array.prototype;

var propertiesToCheck = {};

var mapping = {
    margin: [
        'margin-top',
        'margin-bottom',
        'margin-left',
        'margin-right'
    ],
    padding: [
        'padding-top',
        'padding-bottom',
        'padding-left',
        'padding-right'
    ],
    font: [
        'font-family',
        'font-size',
        'line-height'
    ]
};

(function () {
    for (var prop in mapping) {
        if (mapping.hasOwnProperty(prop)) {
            for (var i = 0, len = mapping[prop].length; i < len; i++) {
                propertiesToCheck[mapping[prop][i]] = prop;
            }
        }
    }
})();

var lineCache = 0;

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        var ruleVal = opts.ruleVal;
        var realRuleVal = [];
        arrayProto.push[Array.isArray(ruleVal) ? 'apply' : 'call'](realRuleVal, ruleVal);

        if (realRuleVal.length) {
            if (realRuleVal.indexOf('color') > -1) {

                lineCache = 0;

                css.eachDecl(function (decl) {
                    var parts = postcss.list.space(decl.value);
                    for (var i = 0, len = parts.length; i < len; i++) {
                        var part = parts[i];
                        if (PATTERN_COLOR.test(part)) {
                            var source = decl.source;
                            if (lineCache !== source.start.line) {
                                lineCache = source.start.line;
                                var line = source.start.line;
                                var lineContent = util.getLineContent(line, source.input.css);
                                var col = source.start.column + decl.prop.length + decl.between.length;
                                result.warn(RULENAME, {
                                    node: decl,
                                    ruleName: RULENAME,
                                    errorChar: 'color',
                                    line: line,
                                    col: col,
                                    message: colorMsg,
                                    colorMessage: '`'
                                        + util.changeColorByStartAndEndIndex(
                                            lineContent, col, source.end.column
                                        )
                                        + '` '
                                        + chalk.grey(colorMsg)
                                });
                                global.CSSHINT_INVALID_ALL_COUNT++;
                            }
                        }
                    }
                });
            }

            if (realRuleVal.indexOf('property') > -1) {
                var tmp = {};
                css.eachRule(function (rule) {
                    tmp = {};
                    var nodes = rule.nodes;
                    var selector = rule.selector;
                    for (var i = 0, len = nodes.length; i < len; i++) {
                        var decl = nodes[i];
                        if (decl.type === 'decl') {
                            var prop = decl.prop;
                            var v = propertiesToCheck[prop];
                            if (!v) {
                                continue;
                            }

                            if (!tmp[v]) {
                                tmp[v] = 1;
                            }
                            else {
                                tmp[v] += 1;
                            }

                            if (tmp[v] >= mapping[v].length) {
                                var source = decl.source;
                                var line = source.start.line;
                                var col = source.start.column;

                                var msg = getPropertyMsg(mapping[v].join(', '), selector, v);

                                result.warn(RULENAME, {
                                    node: decl,
                                    ruleName: RULENAME,
                                    errorChar: 'property',
                                    line: line,
                                    col: col,
                                    message: msg.msg,
                                    colorMessage: msg.colorMsg
                                });
                                global.CSSHINT_INVALID_ALL_COUNT++;
                                break;
                            }
                        }
                    }
                });
            }
        }
    };
});

/**
 * 获取 property 的错误信息
 *
 * @param {string} propertyStr 出错的属性字符串
 * @param {string} selector 这些出错的属性所在的选择器的名称
 * @param {string} replaceProperty 应该要替换的属性
 *
 * @return {Object} 包含 msg 和 colorMsg 属性的对象
 */
function getPropertyMsg(propertyStr, selector, replaceProperty) {
    return {
        msg: ''
            + 'The properties `'
            + propertyStr
            + '` in the selector `'
            + selector
            + '` can be replaced by '
            + replaceProperty
            + '.',
        colorMsg: chalk.grey(''
            + 'The properties `'
            + chalk.magenta(propertyStr)
            + '` in the selector `'
            + chalk.magenta(selector)
            + '` can be replaced by '
            + chalk.magenta(replaceProperty)
            + '.')
    };
}
