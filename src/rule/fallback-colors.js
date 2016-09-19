/**
 * @file fallback-colors 的检测逻辑
 *       For older browsers that don't support RGBA, HSL, or HSLA, provide a fallback color
 *       https://github.com/CSSLint/csslint/wiki/Require-fallback-colors
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getPropertyValue} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'fallback-colors';

/* eslint-disable fecs-valid-map-set */
const propertiesToCheck = {
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
/* eslint-enable fecs-valid-map-set */

let lastProperty;

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'For older browsers that don\'t support RGBA, HSL, or HSLA, provide a fallback color';

/**
 * decl 的处理
 *
 * @param {Object} decl postcss 节点对象
 * @param {Object} result postcss result 对象
 */
const declHandler = (decl, result) => {
    const prop = decl.prop;
    const value = getPropertyValue(decl.value);

    const len = value.length;
    let i = 0;
    let colorType = '';

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
                    const source = decl.source;
                    const line = source.start.line;
                    const col = source.start.column;
                    const str = 'Fallback ' + prop + ' (hex or RGB) should precede '
                        + colorType + ' ' + prop;
                    const colorStr = 'Fallback ' + chalk.magenta(prop) + ' (hex or RGB) should precede '
                        + chalk.magenta(colorType) + ' ' + chalk.magenta(prop);
                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: str + MSG,
                        colorMessage: '`'
                            + colorStr
                            + '` '
                            + chalk.grey(MSG)
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
};

/**
 * 具体的检测逻辑
 *
 * @param {Object} opts 参数
 * @param {*} opts.ruleVal 当前规则具体配置的值
 * @param {string} opts.fileContent 文件内容
 * @param {string} opts.filePath 文件路径
 */
export const check = postcss.plugin(RULENAME, opts =>
    (css, result) => {
        if (!opts.ruleVal) {
            return;
        }

        css.walkRules(rule => {
            lastProperty = null;

            rule.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                if (propertiesToCheck[decl.prop]) {
                    declHandler(decl, result);
                }

                lastProperty = decl;
            });

        });
    }
);
