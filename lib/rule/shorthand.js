/**
 * @file shorthand 的检测逻辑
 *       `property` 对应 015: [建议] 在可以使用缩写的情况下，尽量使用属性缩写。
 *       `color` 对应 030: [强制] 颜色值可以缩写时，必须使用缩写形式。
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');
var util = require('../util');

var msg = 'Color value can be abbreviated, must use the abbreviation form';

var properties = {};
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


/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty(event) {
    var me = this;
    var ruleVal = me.ruleVal;

    if (ruleVal.indexOf('property') !== -1) {
        var propertyName = event.property.toString().toLowerCase();
        if (propertiesToCheck[propertyName]) {
            properties[propertyName] = 1;
        }
    }

    if (ruleVal.indexOf('color') !== -1) {
        var fileContent = me.fileContent;
        var ruleName = me.ruleName;
        var invalidList = me.invalidList;
        var parts = event.value.parts;
        var len = parts.length;

        for (var i = 0; i < len; i++) {
            var part = parts[i];
            if (part.type === 'color') {
                var text = part.text;
                if (/^#([\da-f])\1([\da-f])\2([\da-f])\3$/i.test(text)) {
                    var line = part.line;
                    var lineContent = util.getLineContent(line, fileContent);
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: part.col,
                        errorChar: 'color',
                        message: '`'
                            + lineContent
                            + '` '
                            + msg,
                        colorMessage: '`'
                            + util.changeColorByIndex(lineContent, part.col - 1, text)
                            + '` '
                            + chalk.grey(msg)
                    });
                }
            }
        }
    }
}

/**
 * endrule 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function endRule(event) {
    var me = this;
    var ruleName = me.ruleName;
    var invalidList = me.invalidList;

    for (var prop in mapping) {
        if (mapping.hasOwnProperty(prop)) {
            var total = 0;
            for (var i = 0, len = mapping[prop].length; i < len; i++) {
                total += properties[mapping[prop][i]] ? 1 : 0;
            }

            if (total === mapping[prop].length) {
                var msg = ''
                    + 'The properties `'
                    + mapping[prop].join(', ')
                    + '`'
                    + ' in the selector `'
                    + event.selectors.toString()
                    + '` can be replaced by '
                    + prop
                    + '.';
                invalidList.push({
                    ruleName: ruleName,
                    line: event.line,
                    col: event.col,
                    errorChar: 'property',
                    message: msg,
                    colorMessage: chalk.grey(''
                        + 'The properties `'
                        + chalk.magenta(mapping[prop].join(', '))
                        + '`'
                        + ' in the selector `'
                        + chalk.magenta(event.selectors.toString())
                        + '` can be replaced by '
                        + chalk.magenta(prop)
                        + '`')
                });
            }
        }
    }
}

/**
 * startrule 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function startRule(event) {
    properties = {};
}


/**
 * 模块的输出接口
 * hint 目录下的多个文件在 addListener 时，相同的 eventType 会 add 多次
 * 这是没有关系的，在 parserlib 在 fire 的时候，会一个一个的执行
 *
 * @param {Object} parser parserlib.css.Parser 实例
 * @param {string} fileContent 当前检测文件内容
 * @param {string} ruleName 当前检测的规则名称
 * @param {string} ruleVal 当前检测规则对应的配置值
 * @param {Array.<Object>} invalidList 不合法文件集合
 *
 * @return {Array.<Object>} 不合法文件集合
 */
module.exports = function (parser, fileContent, ruleName, ruleVal, invalidList) {

    if (!ruleVal) {
        return invalidList;
    }

    // ruleVal 可能是字符串，所以这里判断下，放入到 realRuleVal 数组中
    var realRuleVal = [];

    if (!Array.isArray(ruleVal)) {
        realRuleVal.push(ruleVal);
    }
    else {
        realRuleVal = realRuleVal.concat(ruleVal);
    }

    parser.addListener(
        'property',
        checkProperty.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: realRuleVal,
            invalidList: invalidList
        })
    );

    if (realRuleVal.indexOf('property') !== -1) {

        parser.addListener(
            'startrule',
            startRule.bind({
                parser: parser,
                fileContent: fileContent,
                ruleName: ruleName,
                ruleVal: realRuleVal,
                invalidList: invalidList
            })
        );

        parser.addListener(
            'endrule',
            endRule.bind({
                parser: parser,
                fileContent: fileContent,
                ruleName: ruleName,
                ruleVal: realRuleVal,
                invalidList: invalidList
            })
        );
    }

    return invalidList;
};
