/**
 * @file duplicate-properties 的检测逻辑
 *       Duplicate properties must appear one after the other
 *       https://github.com/CSSLint/csslint/wiki/Disallow-duplicate-properties
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'duplicate-properties';

const MSG = 'Duplicate properties must appear one after the other';

let properties = {};
let lastProperty = '';

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

                const {prop, value} = decl;
                if (properties[prop] && (lastProperty !== prop || properties[prop] === value)) {
                    const source = decl.source;
                    const line = source.start.line;
                    const lineContent = getLineContent(line, source.input.css);
                    const col = source.start.column;
                    result.warn(RULENAME, {
                        node: decl,
                        ruleName: RULENAME,
                        line: line,
                        col: col,
                        message: MSG,
                        colorMessage: '`'
                            + chalk.magenta(lineContent)
                            + '` '
                            + chalk.grey(MSG)
                    });
                    global.CSSHINT_INVALID_ALL_COUNT++;
                }

                properties[prop] = value;
                lastProperty = prop;
            });
        });
    }
);
