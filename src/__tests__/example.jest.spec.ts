'use strict';

import {
    normalLoop,
    returnSth,
    asyncTwoCallback,
    someProcessAsyncFake,
} from '@/example-for-test';

/**
 * expect(actual).toBe(expected)
 * 判断运行结果 actual 是否是预期值 expected
 */
describe('expect', () => {
    it('expect', () => {
        const loopCount: number = 10000;

        expect(normalLoop(loopCount)).toBe(10000);
    });
});

/**
 * 用来匹配数组中是否包括这些个元素
 * 只能在 toEqual 和 toBeCalledWith 里作为参数传入
 */
describe('arrayContaining', () => {
    it('arrayContaining', () => {
        expect([ 'a', 'b', 'c', ]).toEqual(expect.arrayContaining([ 'b', 'c', ]));
    });
});

/**
 * anything 可以匹配到任何非空值
 * 只能在 toEqual 和 toBeCalledWith 里作为参数传入
 */
describe('anything', () => {
    it('anything', () => {
        expect(returnSth(true)).toEqual(expect.anything());
    });

    it('any', () => {
        expect(returnSth(true)).toEqual(expect.any(Number));
    });
});

/**
 * 计数断言的执行次数, 如果次数不对就报错
 *
 * 官网的 demo 不对, 这个必须做成 await / async 或者 return promise
 * 要不然不会等待 callback 执行
 */
describe('about assertions emit', () => {

    it('count assertions call times', async () => {
        expect.assertions(2);

        await asyncTwoCallback(() => {
            expect(true).toBeTruthy();
        }, () => {
            expect(true).toBeTruthy();
        });
    });

    it('is have an assertion', () => {
        expect.hasAssertions();

        return new Promise(res =>
            someProcessAsyncFake(false, (err?: Error, data?: any) => {
                expect(err).toBeUndefined();
                res();
            })
        );
    });
});
