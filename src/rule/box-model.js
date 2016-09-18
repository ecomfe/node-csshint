/**
 * @file box-model 的检测逻辑
 *       Don't use width or height when using padding or border
 *       https://github.com/CSSLint/csslint/wiki/Beware-of-box-model-size
 * @author ielgnaw(wuji0223@gmail.com)
 */

 import chalk from 'chalk';
 import postcss from 'postcss';

 import {getPropertyValue} from '../util';

 'use strict';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'box-model';

/**
 * 获取宽度的错误信息
 *
 * @param {string} prop 属性名称
 *
 * @return {Object} 错误信息
 */
const getWidthMsg = prop => {
    return {
        str: ''
            + 'Using width with `'
            + prop
            + '` can sometimes make elements larger than you expect',
        colorStr: ''
            + 'Using width with `'
            + chalk.magenta(prop)
            + '` can sometimes make elements larger than you expect'
    };
};

/**
 * 获取高度的错误信息
 *
 * @param {string} prop 属性名称
 *
 * @return {Object} 错误信息
 */
const getHeightMsg = prop => {
    return {
        str: ''
            + 'Using height with `'
            + prop
            + '` can sometimes make elements larger than you expect',
        colorStr: ''
            + 'Using height with `'
            + chalk.magenta(prop)
            + '` can sometimes make elements larger than you expect'
    };
};

const widthProperties = {
    'border': 1,
    'border-left': 1,
    'border-right': 1,
    'padding': 1,
    'padding-left': 1,
    'padding-right': 1
};

const heightProperties = {
    'border': 1,
    'border-bottom': 1,
    'border-top': 1,
    'padding': 1,
    'padding-bottom': 1,
    'padding-top': 1
};

let properties = {};
let boxSizing = false;

export const check = postcss.plugin(RULENAME, opts =>
    (css, result) => {
        if (!opts.ruleVal) {
            return;
        }

        css.walkRules(rule => {
            /* jshint maxstatements: 27 */
            properties = {};
            boxSizing = false;

            rule.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const {prop, value} = decl;

                if (heightProperties[prop] || widthProperties[prop]) {
                    if (!/^0\S*$/.test(value) && !(prop === 'border' && value.toString() === 'none')) {
                        properties[prop] = decl;
                    }
                }
                else {
                    if (/^(width|height)/i.test(prop)
                        && /^(length|percentage)/.test(getPropertyValue(value)[0].type)
                    ) {
                        properties[prop] = 1;
                    }
                    else if (prop === 'box-sizing') {
                        boxSizing = true;
                    }
                }
            });

            if (boxSizing) {
                return;
            }

            if (properties.height) {
                for (const hp in heightProperties) {
                    if (heightProperties.hasOwnProperty(hp) && properties[hp]) {
                        const hpValue = properties[hp].value;
                        const hpValueParts = postcss.list.space(hpValue);
                        // 排除 padding: 0 10px; 这样的情况
                        if (!(hp === 'padding' && hpValueParts.length === 2 && parseInt(hpValueParts[0], 10) === 0)) {
                            const hSource = properties[hp].source;
                            const hLine = hSource.start.line;
                            const hMsg = getHeightMsg(hp);
                            result.warn(RULENAME, {
                                node: properties[hp],
                                ruleName: RULENAME,
                                line: hLine,
                                message: hMsg.str,
                                colorMessage: hMsg.colorStr
                            });
                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }
                }
            }

            if (properties.width) {
                for (const wp in widthProperties) {
                    if (widthProperties.hasOwnProperty(wp) && properties[wp]) {
                        const wpValue = properties[wp].value;
                        const wpValueParts = postcss.list.space(wpValue);
                        // 排除 padding: 10px 0; 这样的情况
                        if (!(wp === 'padding' && wpValueParts.length === 2 && parseInt(wpValueParts[1], 10) === 0)) {
                            const wSource = properties[wp].source;
                            const wLine = wSource.start.line;
                            const wMsg = getWidthMsg(wp);
                            result.warn(RULENAME, {
                                node: properties[wp],
                                ruleName: RULENAME,
                                line: wLine,
                                message: wMsg.str,
                                colorMessage: wMsg.colorStr
                            });
                            global.CSSHINT_INVALID_ALL_COUNT++;
                        }
                    }
                }
            }
        });
    }
);
