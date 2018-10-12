'use strict';

import {
    default as assert,
    strictEqual,
    deepStrictEqual
} from 'assert';

import {
    normalLoop,
    formatDate,
    ArrayDataItem
} from '@/test-functions';

describe('normal test case with no asserts', () => {
    it('do sth', () => {
        const loopCount: number = 10000;

        normalLoop(loopCount);
    });
});

describe('normal test case with asserts', () => {
    it('simplest assert', () => {
        const loopCount: number = 10000;
        const result: number = normalLoop(loopCount);
        // assert 函数内的值为 "真" 时才会通过
        assert(result === loopCount, 'result must be 10000');
    });

    it('compare values with equal API', () => {
        const loopCount: number = 10000;
        const result: number = normalLoop(loopCount);
        // 前方值与后方值相同时才会通过 (strict 模式下为 === 匹配)
        strictEqual(result, loopCount, 'result must be 10000');
    });

    it('object deep comparison', () => {
        const origin: ArrayDataItem[] = [{
            timestamp: 1538352000000
        }, {
            timestamp: 1539129600000
        }, ];

        const result: ArrayDataItem[] = formatDate(origin);

        deepStrictEqual(result, [{
            timestamp: 1538352000000,
            date: '2018-10-1'
        }, {
            timestamp: 1539129600000,
            date: '2018-10-10'
        } ], 'array items should be attached date string');
    });
});
