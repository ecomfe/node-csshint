var postcss = require('postcss');
module.exports = postcss.plugin('require-before-space', function (options) {
    return function (css, result) {
        // console.warn(css);
        // console.warn();
        css.eachRule(function (rule) {
            if (rule.between === '') {
                result.warn('cccccc', { node: rule });
            }
        });
    };
});
