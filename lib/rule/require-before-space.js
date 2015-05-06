/**
 * @file require-before-space 的检测逻辑
 *       `{` 对应 003: [强制] `选择器` 与 `{` 之间必须包含空格。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var postcss = require('postcss');

var msg = 'Must contain spaces before the `{`';

module.exports = postcss.plugin('require-before-space', function (options) {

    return function (css, result) {
        css.eachRule(function (rule) {
            if (rule.between === '') {
                result.warn(msg, {
                    node: rule
                });
            }
        });
    };
});
