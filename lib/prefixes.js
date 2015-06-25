/**
 * @file prefixes
 * @author ielgnaw(wuji0223@gmail.com)
 */

/**
 * 所有的 prefixes
 * http://peter.sh/experiments/vendor-prefixed-css-property-overview/
 * value 后有空格说明有标准模式
 *
 * @type {Object}
 */
var prefixes = {
    /* eslint-disable fecs-camelcase */

    'animation': 'webkit moz ',
    'animation-delay': 'webkit moz ',
    'animation-direction': 'webkit moz ',
    'animation-duration': 'webkit moz ',
    'animation-fill-mode': 'webkit moz ',
    'animation-iteration-count': 'webkit moz ',
    'animation-name': 'webkit moz ',
    'animation-play-state': 'webkit moz ',
    'animation-timing-function': 'webkit moz ',
    'appearance': 'webkit moz ',
    'border-end': 'webkit moz ',
    'border-end-color': 'webkit moz ',
    'border-end-style': 'webkit moz ',
    'border-end-width': 'webkit moz ',
    'border-image': 'webkit moz o ',
    'border-radius': 'webkit moz ',
    'border-start': 'webkit moz ',
    'border-start-color': 'webkit moz ',
    'border-start-style': 'webkit moz ',
    'border-start-width': 'webkit moz ',
    'box-align': 'webkit moz ms ',
    'box-direction': 'webkit moz ms ',
    'box-flex': 'webkit moz ms ',
    'box-lines': 'webkit ms ',
    'box-ordinal-group': 'webkit moz ms ',
    'box-orient': 'webkit moz ms ',
    'box-pack': 'webkit moz ms ',
    'box-sizing': 'webkit moz ',
    'box-shadow': 'webkit moz ',
    'column-count': 'webkit moz ms ',
    'column-gap': 'webkit moz ms ',
    'column-rule': 'webkit moz ms ',
    'column-rule-color': 'webkit moz ms ',
    'column-rule-style': 'webkit moz ms ',
    'column-rule-width': 'webkit moz ms ',
    'column-width': 'webkit moz ms ',
    'hyphens': 'epub moz ',
    'line-break': 'webkit ms ',
    'margin-end': 'webkit moz ',
    'margin-start': 'webkit moz ',
    'marquee-speed': 'webkit wap ',
    'marquee-style': 'webkit wap ',
    'padding-end': 'webkit moz ',
    'padding-start': 'webkit moz ',
    'tab-size': 'moz o ',
    'text-size-adjust': 'webkit ms ',
    'transform': 'webkit moz ms o ',
    'transform-origin': 'webkit moz ms o ',
    'transition': 'webkit moz o ',
    'transition-delay': 'webkit moz o ',
    'transition-duration': 'webkit moz o ',
    'transition-property': 'webkit moz o ',
    'transition-timing-function': 'webkit moz o ',
    'user-modify': 'webkit moz ',
    'user-select': 'webkit moz ms ',
    'word-break': 'epub ms ',
    'writing-mode': 'epub ms',
    'background-size': 'webkit moz o ',
    'flex': 'webkit moz ms ',
    'filter': 'webkit ',
    'background-clip': 'webkit moz khtml '

    /* eslint-enable fecs-camelcase */
};


var arrayPush = Array.prototype.push;
var allPrefixes = [];

for (var prop in prefixes) {
    if (prefixes.hasOwnProperty(prop)) {
        var variations = [];
        var prefixed = prefixes[prop].split(' ');
        for (var i = 0, len = prefixed.length; i < len; i++) {
            // 标准模式
            if (prefixed[i] === '') {
                variations.push(prop);
            }
            else {
                variations.push('-' + prefixed[i] + '-' + prop);
            }
        }
        prefixes[prop] = variations;
        arrayPush.apply(allPrefixes, variations);
    }
}

module.exports = {

    /**
     * 获取所有的 prefixes
     *
     * @return {Array} 集合
     */
    getPrefixList: function () {
        return allPrefixes;
    },

    /**
     * 获取所有的 prefixes
     *
     * @return {Array} 对象
     */
    getPrefixMap: function () {
        return prefixes;
    }
};
