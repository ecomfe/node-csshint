/**
 * @file box-model 的检测逻辑
 *       Don't use width or height when using padding or border
 * @author ielgnaw(wuji0223@gmail.com)
 */

var chalk = require('chalk');

/* eslint-disable fecs-camelcase */

var widthProperties = {
    'border': 1,
    'border-left': 1,
    'border-right': 1,
    'padding': 1,
    'padding-left': 1,
    'padding-right': 1
};

var heightProperties = {
    'border': 1,
    'border-bottom': 1,
    'border-top': 1,
    'padding': 1,
    'padding-bottom': 1,
    'padding-top': 1
};

/* eslint-enable fecs-camelcase */

var properties;
var boxSizing = false;

/**
 * property 事件回调函数
 * 这个函数的上下文是 addListener 时 bind 的数据对象
 *
 * @param {Object} event 事件对象
 */
function checkProperty(event) {

    var name = event.property.text.toLowerCase();

    if (heightProperties[name] || widthProperties[name]) {
        if (!/^0\S*$/.test(event.value)
            && !(name === 'border' && event.value === 'none')
        ) {
            properties[name] = {
                line: event.property.line,
                col: event.property.col,
                prop: event.property,
                value: event.value
            };
        }
    }
    else {
        if (/^(width|height)/i.test(name)
            && /^(length|percentage)/.test(event.value.parts[0].type)
        ) {
            properties[name] = 1;
        }
        else if (name === 'box-sizing') {
            boxSizing = true;
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
    boxSizing = false;
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

    if (boxSizing) {
        return;
    }

    var prop;
    var value;
    var col;
    var line;

    if (properties.height) {
        for (prop in heightProperties) {
            if (heightProperties.hasOwnProperty(prop) && properties[prop]) {
                value = properties[prop].value;
                if (!(prop === 'padding'
                    && value.parts.length === 2
                    && value.parts[0].value === 0)
                ) {
                    col = properties[prop].col;
                    line = properties[prop].line;
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: col,
                        message: ''
                            + 'Using height with `'
                            + prop
                            + '` can sometimes make elements larger than you expect',
                        colorMessage: ''
                            + 'Using height with `'
                            + chalk.magenta(prop)
                            + '` can sometimes make elements larger than you expect'
                    });
                }
            }
        }
    }

    if (properties.width) {
        for (prop in widthProperties) {
            if (widthProperties.hasOwnProperty(prop) && properties[prop]) {
                value = properties[prop].value;

                if (!(prop === 'padding'
                    && value.parts.length === 2
                    && value.parts[1].value === 0)
                ) {
                    col = properties[prop].col;
                    line = properties[prop].line;
                    invalidList.push({
                        ruleName: ruleName,
                        line: line,
                        col: col,
                        message: ''
                            + 'Using width with `'
                            + prop
                            + '` can sometimes make elements larger than you expect',
                        colorMessage: ''
                            + 'Using width with `'
                            + chalk.magenta(prop)
                            + '` can sometimes make elements larger than you expect'
                    });
                }
            }
        }
    }

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

    parser.addListener(
        'property',
        checkProperty.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'startrule',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'startfontface',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'startpage',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'startpagemargin',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'startkeyframerule',
        startRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'endrule',
        endRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'endfontface',
        endRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'endpage',
        endRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'endpagemargin',
        endRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );

    parser.addListener(
        'endkeyframerule',
        endRule.bind({
            parser: parser,
            fileContent: fileContent,
            ruleName: ruleName,
            ruleVal: ruleVal,
            invalidList: invalidList
        })
    );


    return invalidList;
};
