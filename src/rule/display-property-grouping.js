/**
 * @file display-property-grouping 的检测逻辑
 *       Certain properties shouldn't be used with certain display property values
 *       https://github.com/CSSLint/csslint/wiki/Beware-of-display-property-grouping-size
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'display-property-grouping';

const propertiesToCheck = {
    'display': 1,
    'float': 'none',
    'height': 1,
    'width': 1,
    'margin': 1,
    'margin-left': 1,
    'margin-right': 1,
    'margin-bottom': 1,
    'margin-top': 1,
    'padding': 1,
    'padding-left': 1,
    'padding-right': 1,
    'padding-bottom': 1,
    'padding-top': 1,
    'vertical-align': 1
};

let properties = {};

/**
 * 对 decl 的处理
 *
 * @param {Object} result postcss 转换的结果对象
 * @param {string} prop 属性名称
 * @param {string} display display 属性的值
 * @param {string} msg 错误消息要添加的部分
 */
const addWarn = (result, prop, display, msg) => {
    const decl = properties[prop];
    if (decl) {
        if (typeof propertiesToCheck[prop] !== 'string'
            || decl.value.toLowerCase() !== propertiesToCheck[prop]
        ) {
            const source = decl.source;
            const line = source.start.line;
            const col = source.start.column;
            let str = '';
            let colorStr = '';
            if (msg) {
                str = msg + ' can\'t be used with display: `' + display + '`';
                colorStr = msg + ' can\'t be used with display: `' + chalk.magenta(display) + '`';
            }
            else {
                str = '`' + prop + '` can\'t be used with display: `' + display + '`';
                colorStr = ''
                    + '`'
                    + chalk.magenta(prop)
                    + '` can\'t be used with display: `'
                    + chalk.magenta(display) + '`';
            }

            result.warn(RULENAME, {
                node: decl,
                ruleName: RULENAME,
                line: line,
                col: col,
                message: str,
                colorMessage: colorStr
            });
            global.CSSHINT_INVALID_ALL_COUNT++;
        }
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
            properties = {};

            rule.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const prop = decl.prop;
                if (propertiesToCheck[prop]) {
                    properties[prop] = decl;
                }
            });

            const display = properties.display ? properties.display.value : null;
            if (!display) {
                return;
            }

            switch (display) {
                // height, width, margin-top, margin-bottom, float should not be used with inline
                case 'inline':
                    addWarn(result, 'height', display);
                    addWarn(result, 'width', display);
                    addWarn(result, 'margin', display);
                    addWarn(result, 'margin-top', display);
                    addWarn(result, 'margin-bottom', display);
                    addWarn(result, 'float', display,
                        'display:inline has no effect on floated elements '
                            + '(but may be used to fix the IE6 double-margin bug).'
                    );
                    break;
                // vertical-align should not be used with block
                case 'block':
                    addWarn(result, 'vertical-align', display);
                    break;
                // float should not be used with inline-block
                case 'inline-block':
                    addWarn(result, 'float', display);
                    break;
                // margin, float should not be used with table
                default:
                    if (display.indexOf('table-') === 0) {
                        addWarn(result, 'margin', display);
                        addWarn(result, 'margin-left', display);
                        addWarn(result, 'margin-right', display);
                        addWarn(result, 'margin-top', display);
                        addWarn(result, 'margin-bottom', display);
                        addWarn(result, 'float', display);
                    }
            }
        });
    }
);
