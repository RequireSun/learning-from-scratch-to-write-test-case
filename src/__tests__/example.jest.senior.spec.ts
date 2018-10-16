'use strict';

import {
    returnsInput,
    asyncTwoCallback,
    someProcessAsyncFake,
} from '@/example-for-test';

import assert from 'assert';

/**
 * 这个东西可以包裹函数进行监听和 mock
 */
describe('mock wrapper: jest.fn', () => {
    it('mock a function', () => {
        const mockFn = jest.fn(() => 'yes');
        // 不会影响函数的正常运行
        assert('yes' === mockFn());
        // 而且能够被函数行为统计断言中使用
        expect(mockFn).toHaveBeenCalled();
    });
});

/**
 * 为 expect 扩展自定义的断言方法
 */
describe('expect.extend to attach matcher on expect', () => {
    expect.extend({
        toBeWithinRange(received: number, floor: number, ceiling: number): { message(): string | (() => string), pass: boolean } {
            const pass: boolean = received >= floor && received <= ceiling;

            if (pass) {
                return {
                    message: () =>
                        `expected ${received} not to be within range ${floor} - ${ceiling}`,
                    pass: true,
                };
            } else {
                return {
                    message: () =>
                        `expected ${received} to be within range ${floor} - ${ceiling}`,
                    pass: false,
                };
            }
        },
    });

    // TODO 找个声明合并的方法

    (expect(100) as any).toBeWithinRange(90, 110);
    (expect(101).not as any).toBeWithinRange(0, 100);
});

describe('function called assertion', () => {
    it('is function has been called', () => {
        const cb = jest.fn();

        cb();

        expect(cb).toHaveBeenCalled();
    });

    it('use toHaveBeenCalled in async callback', () => {
        const cb = jest.fn();

        someProcessAsyncFake(false, cb);

        setTimeout(() => {
            expect(cb).toHaveBeenCalled();
        }, 250);
    });

    /**
     * 非 async 的和 toHaveBeenCalled 一样, 所以就不再写了
     */
    it('count function called times', async () => {
        const cb = jest.fn();

        await asyncTwoCallback(cb, cb);

        expect(cb).toHaveBeenCalledTimes(2);
    });

    // 这两个估计是用不上, 想不出例子来, 所以不讲了
    // .toHaveBeenCalledWith
    // .toHaveBeenLastCalledWith

    it('is function correctly returns', () => {
        const cb = jest.fn(() => {});

        cb();

        expect(cb).toHaveReturned();
    });

    /**
     * 注意: 这里是 toBe 一样的全等匹配
     */
    it('what function returns', () => {
        const fn = jest.fn(returnsInput);

        const input = {
            test: 1,
            a: 'test',
        };
        fn(input);

        expect(fn).toHaveReturnedWith(input);
    });

    // 这两个跟上文一样用的, 不再赘述
    // .toHaveReturnedTimes
    // .toHaveLastReturnedWith
    // .toHaveNthReturnedWith
});
