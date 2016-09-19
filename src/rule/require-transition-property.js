/**
 * @file require-transition-property 的检测逻辑
 *       041: [强制] 使用 `transition` 时应指定 `transition-property`。
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
const RULENAME = 'require-transition-property';

/**
 * 错误的信息
 *
 * @const
 * @type {string}
 */
const MSG = 'When using the `transition`, `transition-property` should be specified';

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

                if (prop === 'transition') {
                    const parts = postcss.list.space(decl.value);
                    if (parts.indexOf('all') > -1) {
                        const source = decl.source;
                        const line = source.start.line;
                        const lineContent = getLineContent(line, source.input.css);
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            message: MSG,
                            colorMessage: '`'
                                + lineContent.replace(/\ball\b/g, chalk.magenta('all'))
                                + '` '
                                + chalk.grey(MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
            });
        }
    }
);
