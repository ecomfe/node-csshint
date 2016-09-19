/**
 * @file vendor-prefixes-sort 的检测逻辑
 *       046: [强制] 带私有前缀的属性由长到短排列，按冒号位置对齐。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent} from '../util';
import {getPrefixList} from '../prefixes';

const prefixList = getPrefixList();

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'vendor-prefixes-sort';

/**
 * 错误信息，带私有前缀的属性按冒号位置对齐
 *
 * @const
 * @type {string}
 */
const colonMsg = 'Property with private prefix should be according to the colon position alignment';

/**
 * 错误信息，带私有前缀的属性由长到短排列
 *
 * @const
 * @type {string}
 */
const shortMsg = 'Property with private prefix from long to short arrangement';

let countMap = {};

/**
 * 判断是否是合法的 css 属性名称
 *
 * @param {Object} decl postcss 节点对象
 *
 * @return {boolean} 结果
 */
const isValidVendorProp = (decl) => {
    const prop = decl.prop;
    const standardProperty = prop.replace(/^\-(webkit|moz|ms|o)\-/g, '');
    // 标准模式在 prefixList 中，那么如果 propertyName 不在 prefixList 中
    // 即这个属性用错了，例如 -o-animation
    if (prefixList.indexOf(standardProperty) > -1) {
        if (prefixList.indexOf(prop) <= -1) {
            return false;
        }
        // 按选择器分组
        let selector = decl.parent.selector;
        let parent = decl.parent;

        while (parent.type !== 'root') {
            parent = parent.parent || {};
            if (parent.type === 'atrule') {
                selector += '-in-atrule-' + (parent.name || '');
            }
        }

        if (!countMap[selector]) {
            countMap[selector] = {};
        }
        const tmp = countMap[selector];

        if (!tmp[standardProperty]) {
            tmp[standardProperty] = [];
        }
        tmp[standardProperty].push(decl);
    }
    return true;
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
        /* jshint maxstatements: 31, maxcomplexity: 11 */

        if (!opts.ruleVal) {
            return;
        }

        countMap = {};

        css.walkDecls(decl => {
            if (global.CSSHINT_INVALID_ALL_COUNT >= opts.maxError) {
                return;
            }
            if (!isValidVendorProp(decl, result)) {
                return;
            }
        });

        for (let selector in countMap) {
            if (!countMap.hasOwnProperty(selector)) {
                continue;
            }

            for (let j in countMap[selector]) {
                if (!countMap[selector].hasOwnProperty(j)) {
                    continue;
                }
                let maxLength = 0;
                let firstColonIndex = 0;
                for (let i = 0, len = countMap[selector][j].length; i < len; i++) {
                    const item = countMap[selector][j][i];
                    const prop = item.prop;

                    if (countMap[selector][prop.replace(/^\-(webkit|moz|ms|o)\-/g, '')].length <= 1) {
                        continue;
                    }

                    const source = item.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);

                    const length = prop.length;

                    // 第一个
                    if (maxLength === 0) {
                        maxLength = length;
                        firstColonIndex = lineContent.indexOf(':') + 1;
                    }

                    const curColonIndex = lineContent.indexOf(':') + 1;
                    if (firstColonIndex !== curColonIndex) {
                        result.warn(RULENAME, {
                            node: item,
                            ruleName: RULENAME,
                            line: line,
                            message: '`'
                                + lineContent
                                + '` '
                                + colonMsg,
                            colorMessage: '`'
                                + chalk.magenta(lineContent)
                                + '` '
                                + chalk.grey(colonMsg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }

                    if (maxLength < length) {
                        result.warn(RULENAME, {
                            node: item,
                            ruleName: RULENAME,
                            line: line,
                            message: '`'
                                + lineContent
                                + '` '
                                + shortMsg,
                            colorMessage: '`'
                                + chalk.magenta(lineContent)
                                + '` '
                                + chalk.grey(shortMsg)
                        });

                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            }
        }
    }
);
