/**
 * @file omit-protocol-in-url 的检测逻辑
 *       027: [建议] `url()` 函数中的绝对路径可省去协议名。
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chalk from 'chalk';
import postcss from 'postcss';

import {getLineContent, changeColorByIndex} from '../util';

/**
 * 当前文件所代表的规则名称
 *
 * @const
 * @type {string}
 */
const RULENAME = 'omit-protocol-in-url';

/**
 * 匹配 css 中 url 的正则
 *
 * @const
 * @type {RegExp}
 */
const PATTERN_URL = /\burl\s*\((["']?)([^\)]+)\1\)/g;

/**
 * 匹配 url() 中 path 的协议
 */
const PATTERN_PROTOCOL = /^((https?|s?ftp|irc[6s]?|git|afp|telnet|smb):\/\/){1}/gi;

/**
 * 错误信息
 *
 * @const
 * @type {string}
 */
const MSG = 'Path in the `url()` should remove protocol';

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

                const {source, value} = decl;
                const line = source.start.line;
                const lineContent = getLineContent(line, source.input.css);

                let match = null;
                let matchProtocol = null;

                /* eslint-disable no-extra-boolean-cast */
                while (!!(match = PATTERN_URL.exec(value))) {
                    const url = match[2];

                    // decl.value 相对于 lineContent 的 index
                    const valueIndex = lineContent.indexOf(decl.value);

                    // 相对于 decl.value 的 index
                    const index = valueIndex + match.input.indexOf(url);
                    while (!!(matchProtocol = PATTERN_PROTOCOL.exec(url))) {
                        result.warn(RULENAME, {
                            node: decl,
                            ruleName: RULENAME,
                            line: line,
                            col: index + 1,
                            message: MSG,
                            colorMessage: '`'
                                + changeColorByIndex(lineContent, index, matchProtocol[0])
                                + '` '
                                + chalk.grey(MSG)
                        });
                        global.CSSHINT_INVALID_ALL_COUNT++;
                    }
                }
                /* eslint-enable no-extra-boolean-cast */
            });
        }
    }
);
