/**
 * @file fallback-colors 的检测逻辑
 *       For older browsers that don't support RGBA, HSL, or HSLA, provide a fallback color
 *       https://github.com/CSSLint/csslint/wiki/Require-fallback-colors
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
var RULENAME = 'fallback-colors';

var lastProperty;
var propertiesToCheck = {
    'color': 1,
    'background': 1,
    'border-color': 1,
    'border-top-color': 1,
    'border-right-color': 1,
    'border-bottom-color': 1,
    'border-left-color': 1,
    'border': 1,
    'border-top': 1,
    'border-right': 1,
    'border-bottom': 1,
    'border-left': 1,
    'background-color': 1
};

/**
 * 错误的信息
 *
 * @type {string}
 */
var msg = 'For older browsers that don\'t support RGBA, HSL, or HSLA, provide a fallback color';

module.exports = postcss.plugin(RULENAME, function (opts) {

    return function (css, result) {
        if (!opts.ruleVal) {
            return;
        }

        css.eachRule(function (rule) {
            lastProperty = null;

            rule.eachDecl(function (decl) {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                if (propertiesToCheck[decl.prop]) {
                    declHandler(decl, result);
                }

                lastProperty = decl;
            });

        });
    };
});

/**
 * decl 的处理
 *
 * @param {Object} decl postcss 节点对象
 * @param {Object} result postcss result 对象
 */
function declHandler(decl, result) {
    var prop = decl.prop;
    var value = util.getPropertyValue(decl.value);

    var len = value.length;
    var i = 0;
    var colorType = '';

    while (i < len) {
        if (value[i].type === 'color') {
            if ('alpha' in value[i] || 'hue' in value[i]) {
                if (/([^\)]+)\(/.test(value[i].text)) {
                    colorType = RegExp.$1.toUpperCase();
                }

                if (!lastProperty
                    || (lastProperty.prop !== prop
                        || lastProperty.colorType !== 'compat')
                ) {
                    var source = decl.source;
                    var line = source.start.line;
                    var col = source.start.column;
                    var str = 'Fallback ' + prop + ' (hex or RGB) should precede '
                        + colorType + ' ' + prop;
                    var colorStr = 'Fallback ' + chalk.magenta(prop) + ' (hex or RGB) should precede '
                        + chalk.magenta(colorType) + ' ' + chalk.magenta(prop);
                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: str + msg,
                        colorMessage: '`'
                            + colorStr
                            + '` '
                            + chalk.grey(msg)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }
            }
            else {
                decl.colorType = 'compat';
            }
        }
        i++;
    }
}
