/**
 * @file property-not-existed 的检测逻辑，检测属性是否存在
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getPrefixList} from '../prefixes';

const prefixList = getPrefixList();

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'property-not-existed';

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

        if (opts.ruleVal) {

            css.walkDecls(decl => {
                if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                    return;
                }

                const prop = decl.prop;
                const standardProperty = prop.replace(/^\-(webkit|moz|ms|o)\-/g, '');
                // 标准模式在 prefixList 中，那么如果 propertyName 不在 prefixList 中
                // 即这个属性用错了，例如 -o-animation
                if (prefixList.indexOf(standardProperty) > -1) {
                    if (prefixList.indexOf(prop) <= -1) {

                        const source = decl.source;
                        const line = source.start.line;
                        const col = source.start.column;

                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: col,
                            message: ''
                                + 'Current property '
                                + '`'
                                + prop
                                + '` '
                                + 'is not existed',
                            colorMessage: ''
                                + 'Current property '
                                + '`'
                                + chalk.magenta(prop)
                                + '` '
                                + 'is not existed'
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            });
        }
    }
);
