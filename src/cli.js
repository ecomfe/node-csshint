/**
 * @file 命令行功能模块
 * @author ielgnaw(wuji0223@gmail.com)
 */

import {createReadStream} from 'fs';
import chalk from 'chalk';
import {log} from 'edp-core';
import sys from '../package';
import {formatMsg, getCandidates} from './util';
import {check} from './checker';

/**
 * 显示默认的信息
 */
const showDefaultInfo = () => {
    console.log('');
    console.log((sys.name + ' v' + sys.version));
    console.log(chalk.bold.green(formatMsg(sys.description)));
};

/**
 * 校验结果报告
 *
 * @inner
 * @param {Object} errors 按文件类型为 key，值为对应的校验错误信息列表的对象
 */
const report = errors => {
    let t12 = true;

    if (errors.length) {
        errors.forEach(
            error => {
                log.info(error.path);
                error.messages.forEach(
                    message => {
                        const ruleName = message.ruleName || '';
                        let msg = '→ ' + (ruleName ? chalk.bold(ruleName) + ': ' : '');
                        // 全局性的错误可能没有位置信息
                        if (typeof message.line === 'number') {
                            msg += ('line ' + message.line);
                            if (typeof message.col === 'number') {
                                msg += (', col ' + message.col);
                            }
                            msg += ': ';
                        }

                        msg += message.colorMessage || message.message;
                        log.warn(msg);
                    }
                );
            }
        );
        t12 = false;
    }

    if (t12) {
        log.info('Congratulations! Everything gone well, you are T12!');
    }
    else {
        process.exit(1);
    }
};

/**
 * 解析参数。作为命令行执行的入口
 *
 * @param {Array} args 参数列表
 */
export function parse(args) {
    args = args.slice(2);

    // 不带参数时，默认检测当前目录下所有的 css 文件
    if (args.length === 0) {
        args.push('.');
    }

    if (args[0] === '--version' || args[0] === '-v') {
        showDefaultInfo();
        return;
    }

    const patterns = [
        '**/*.css',
        '!**/{output,test,node_modules,asset,dist,release,doc,dep,report}/**'
    ];

    const candidates = getCandidates(args, patterns);
    let count = candidates.length;

    if (!count) {
        return;
    }

    // 错误信息的集合
    const errors = [];

    /**
     * 每个文件的校验结果回调，主要用于统计校验完成情况
     *
     * @inner
     */
    const callback = () => {
        count--;
        if (!count) {
            report(errors);
        }
    };

    // 遍历每个需要检测的 css 文件
    candidates.forEach(candidate => {
        const readable = createReadStream(candidate, {
            encoding: 'utf8'
        });
        readable.on('data', chunk => {
            const file = {
                content: chunk,
                path: candidate
            };
            check(file, errors, callback);
        });
        readable.on('error', err => {
            throw err;
        });
    });
}
