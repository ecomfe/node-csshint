/**
 * @file lib/util.js的测试用例
 * @author ielgnaw(wuji0223@gmail.com)
 */

import chai from 'chai';
import path from 'path';
import {readFileSync} from 'fs';

'use strict';

let util = require(path.join(__dirname, '../../lib', 'util'));

const expect = chai.expect;

/* globals describe, it */

describe('util test suite\n', function () {
    this.timeout(50000);
    describe('formatMsg', () => {
        it('should return format message', () => {
            const message = util.formatMsg('This is a message', 5);
            expect(message).to.equal('     This is a message');
        });
    });

    describe('lineContent, location', () => {
        const candidateLineNumber = 2;

        const fileContent = readFileSync(
            path.join(__dirname, '../fixture/test.css'),
            'utf8'
        ).replace(/\r\n?/g, '\n');

        it('should return right linecontent', () => {
            const lineContent = util.getLineContent(candidateLineNumber, fileContent);
            expect(lineContent).to.equal('    -webkit-animation: spin 2s infinite linear;');

            const lineContent1 = util.getLineContent(candidateLineNumber, fileContent, true);
            expect(lineContent1).to.equal('-webkit-animation: spin 2s infinite linear;');
        });
    });


    describe('trim', () => {
        it('should return tirm string', () => {
            expect(util.trim('   aaaa   ')).to.equal('aaaa');
            expect(util.trim()).to.equal('');
        });
    });

    describe('changeColorByStartAndEndIndex', () => {
        it('should return right result', () => {
            expect(util.changeColorByStartAndEndIndex('', 1, 3)).to.equal('');
        });
    });

    describe('getCandidates', () => {
        it('should return right result', () => {
            const patterns = [
                '**/always-semicolon.css',
                '!**/{output,node_modules,asset,dist,release,doc,dep,report}/**'
            ];

            const candidates = util.getCandidates([], patterns);
            expect(candidates.length).to.equal(1);
            expect(candidates[0]).to.equal('test/fixture/always-semicolon.css');

            const patterns1 = ['always-semicolon.css'];
            const candidates1 = util.getCandidates(['test/fixture'], patterns1);
            expect(candidates1.length).to.equal(1);
            expect(candidates1[0]).to.equal('test/fixture/always-semicolon.css');

            const candidates2 = util.getCandidates(['test/fixture/always-semicolon.css']);
            expect(candidates2.length).to.equal(1);
            expect(candidates2[0]).to.equal('test/fixture/always-semicolon.css');

            const notExistCandidates = util.getCandidates(['test/fixture1'], patterns1);
            expect(notExistCandidates.length).to.equal(0);
        });
    });

    describe('getIgnorePatterns', () => {
        it('should return right result', () => {
            expect(util.getIgnorePatterns('test/fixture/aaaa.css')).to.eql([]);
        });
    });

    describe('getPropertyValue', () => {
        it('should return right result', () => {
            expect(util.getPropertyValue('123dd')).to.eql(
                [{text: '123dd', value: 123, units: 'dd', type: 'dimension'}]
            );
            expect(util.getPropertyValue('123deg')).to.eql(
                [{text: '123deg', value: 123, units: 'deg', type: 'angle'}]
            );
            expect(util.getPropertyValue('123s')).to.eql(
                [{text: '123s', value: 123, units: 's', type: 'time'}]
            );
            expect(util.getPropertyValue('123hz')).to.eql(
                [{text: '123hz', value: 123, units: 'hz', type: 'frequency'}]
            );
            expect(util.getPropertyValue('123dpi')).to.eql(
                [{text: '123dpi', value: 123, units: 'dpi', type: 'resolution'}]
            );
            expect(util.getPropertyValue('50%')).to.eql(
                [{text: '50%', value: 50, type: 'percentage'}]
            );
            expect(util.getPropertyValue(50)).to.eql(
                [{text: '50', value: 50, type: 'integer'}]
            );
            expect(util.getPropertyValue(50.1)).to.eql(
                [{text: '50.1', value: 50.1, type: 'number'}]
            );
            expect(util.getPropertyValue('#aaaaaa')).to.eql(
                [{text: '#aaaaaa', red: 170, green: 170, blue: 170, type: 'color'}]
            );
            expect(util.getPropertyValue('#aaa')).to.eql(
                [{text: '#aaa', red: 170, green: 170, blue: 170, type: 'color'}]
            );
            expect(util.getPropertyValue('rgb(170, 170, 170)')).to.eql(
                [{text: 'rgb(170, 170, 170)', red: 170, green: 170, blue: 170, type: 'color'}]
            );
            expect(util.getPropertyValue('rgb(5%, 5%, 5%)')).to.eql(
                [{text: 'rgb(5%, 5%, 5%)', red: 12.75, green: 12.75, blue: 12.75, type: 'color'}]
            );
            expect(util.getPropertyValue('rgba(170, 170, 170, 1)')).to.eql(
                [{text: 'rgba(170, 170, 170, 1)', red: 170, green: 170, blue: 170, alpha: 1, type: 'color'}]
            );
            expect(util.getPropertyValue('rgba(5%, 5%, 5%, 1)')).to.eql(
                [{text: 'rgba(5%, 5%, 5%, 1)', red: 12.75, green: 12.75, blue: 12.75, alpha: 1, type: 'color'}]
            );
            expect(util.getPropertyValue('hsl(170, 20%, 20%)')).to.eql(
                [{text: 'hsl(170, 20%, 20%)', hue: 170, saturation: 0.2, lightness: 0.2, type: 'color'}]
            );
            expect(util.getPropertyValue('hsla(170, 20%, 20%, 1)')).to.eql(
                [{text: 'hsla(170, 20%, 20%, 1)', hue: 170, saturation: 0.2, lightness: 0.2, alpha: 1, type: 'color'}]
            );
            expect(util.getPropertyValue('url(http://www.baidu.com)')).to.eql(
                [{text: 'url(http://www.baidu.com)', uri: 'http://www.baidu.com', type: 'uri'}]
            );
            expect(util.getPropertyValue('aaa(1234)')).to.eql(
                [{text: 'aaa(1234)', name: 'aaa', value: 'aaa(1234)', type: 'function'}]
            );
            expect(util.getPropertyValue('"aaa"')).to.eql(
                [{text: '"aaa"', value: 'aaa', type: 'string'}]
            );
            expect(util.getPropertyValue('yellow')).to.eql(
                [{text: 'yellow', red: 255, green: 255, blue: 0, type: 'color'}]
            );
            expect(util.getPropertyValue(',')).to.eql(
                [{text: ',', value: ',', type: 'operator'}]
            );
            expect(util.getPropertyValue('a-a')).to.eql(
                [{text: 'a-a', value: 'a-a', type: 'identifier'}]
            );
        });
    });


});
