'use strict';

import {
    returnsInput,
    asyncTwoCallback,
    someProcessAsyncFake,
    returnSth,
} from '@/example-for-test';

import * as exampleForTest from '@/example-for-test';

import assert from 'assert';

/**
 * 这个东西可以包裹函数进行监听和 mock
 */
describe('mock wrapper: jest.fn', () => {
    beforeEach(() => {
        if (jest.isMockFunction(returnSth)) {
            returnSth.mockRestore();
        }
    });

    it('mock a function', () => {
        const mockFn = jest.fn(() => 'yes');
        // 不会影响函数的正常运行
        assert('yes' === mockFn());
        // 而且能够被函数行为统计断言中使用
        expect(mockFn).toHaveBeenCalled();
        /**
         * 判断一个函数是否是被 mock 了的
         * jest.isMockFunction(function)
         */
        expect(jest.isMockFunction(mockFn)).toBe(true);
    });

    it('mock all functions in module', () => {
        const examples: any = jest.genMockFromModule('../example-for-test');
        // 这时候重新赋值将会干掉 mock, 所以重新赋值一定要包上 jest.fn
        // examples.returnSth = jest.fn(() => false);

        expect(jest.isMockFunction(examples.returnSth)).toBe(true);
    });

    it('mock the return of function', () => {
        // jest.mock('../example-for-test', () => ({
        //     returnSth: jest.fn(),
        // }));

        // const examples = require('../example-for-test');

        jest.mock('../example-for-test', () => {});

        (exampleForTest as any).returnSth = jest.fn();

        (returnSth as any).mockReturnValue('foo');

        expect(returnSth('string')).toBe('foo');

        returnSth('number');

        expect((returnSth as any).mock.calls).toEqual([
            [ 'string', ],
            [ 'number', ],
        ]);

        expect((returnSth as any).mock.results).toEqual([
            { isThrow: false, value: 'foo', },
            { isThrow: false, value: 'foo', },
        ]);
    });

    it('mock the return of function once', () => {
        const fn = jest.fn(returnSth);

        fn.mockReturnValueOnce('xxx');

        expect(fn('string')).toBe('xxx');
        expect(fn('string')).toBeUndefined();
    });

    it('mock reset', () => {
        const fn = jest.fn(returnSth);

        fn.mockReturnValue('xxx');

        expect(fn('string')).toBe('xxx');

        fn.mockReset();

        expect(fn('string')).toBeUndefined();
    });

    it('mock activity', () => {
        const fn = jest.fn(returnSth);

        fn.mockImplementation((input: string) => {
            if ('string' === input) {
                return 'yyy';
            } else {
                return 'ball';
            }
        });

        expect(fn('string')).toBe('yyy');

        expect(fn('boolean')).toBe('ball');
    });
});

describe.skip('使用 .skip 来跳过一组用例, 一般用来暂时注释这部分代码块', () => {
    it('这些用例不会运行', () => {
        throw new Error('unbelievable!');
    });
});

describe('it 的 .skip 方法', () => {
    it.skip('这个用例不会执行', () => {
        throw new Error();
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
