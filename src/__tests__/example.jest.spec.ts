'use strict';

import {
    normalLoop,
    returnSth,
    asyncTwoCallback,
    someProcessAsyncFake,
} from '@/example-for-test';

describe('match API', () => {
    /**
     * expect(actual).toBe(expected)
     * 判断运行结果 actual 是否是预期值 expected
     * 为原始值匹配而生
     */
    it('expect', () => {
        const loopCount: number = 10000;

        expect(normalLoop(loopCount)).toBe(10000);
    });

    /**
     * 为引用值匹配而生 (会遍历引用值的每个子, 来确定结果)
     */
    it('toEqual', () => {
        expect(returnSth('object')).toEqual({ a: 1, });
    });

    /**
     * 等待 promise 执行完成并从中获得 resolve 的值
     */
    it('resolves', () => {
        return expect(Promise.resolve(returnSth('boolean'))).resolves.toBe(true);
    });
});

/**
 * 为值对比而生
 */
describe('any method', () => {
    /**
     * anything 可以匹配到任何非空值
     * 只能在 toEqual 和 toBeCalledWith 里作为参数传入
     */
    it('anything', () => {
        expect(returnSth()).toEqual(expect.anything());
    });

    /**
     * any 表示 "某数据类型的一个值"
     * 只能在 toEqual 和 toBeCalledWith 里作为参数传入
     */
    it('any', () => {
        expect(returnSth('number')).toEqual(expect.any(Number));
    });
});

/**
 * not 会使结果为反 (并不管内部逻辑, 仅仅就相当于对原始结果进行了 `!originValue` 这样的操作)
 */
describe('not', () => {
    it('not toBe', () => {
        expect(returnSth('string')).not.toBe('no');
    });

    it('not toEqual', () => {
        expect(returnSth('array')).not.toEqual([ 1, 2, ]);
    });
});

/**
 * 包含关系
 */
describe('containing', () => {
    /**
     * 用来匹配数组中是否包括这些个元素
     * 只能在 toEqual 和 toBeCalledWith 里作为参数传入
     */
    it('arrayContaining', () => {
        expect([ 'a', 'b', 'c', ]).toEqual(expect.arrayContaining([ 'b', 'c', ]));
    });

    // it('arrayContaining with not', () => {
    //     expect([ 'a', 'b', 'c', ]).not.toEqual(expect.arrayContaining([ 'c', 'd', ]));
    // });

    it('objectContaining', () => {
        expect({
            'a': 1,
            'b': 'test',
            'c': 'x',
        }).toEqual(expect.objectContaining({
            'a': expect.any(Number),
            'b': expect.any(String),
            'c': 'x',
        }));
    });

    // it('objectContaining with not', () => {
    //     expect({
    //         'a': 1,
    //         'b': 'test',
    //         'c': 'x',
    //     }).not.toEqual(expect.objectContaining({
    //         'a': expect.any(String),
    //         'b': expect.any(Number),
    //         'c': 'x',
    //     }));
    // });

    it('stringContaining', () => {
        expect('it\'s a test case').toEqual(expect.stringContaining('test'));
    });

    // it('stringContaining with not', () => {
    //     expect('it\'s a test case').not.toEqual(expect.stringContaining('production'));
    // });

    const expected = [
        expect.stringMatching(/^prod/),
        expect.stringMatching(/^dev/),
    ];

    const expectedObj = {
        production: expect.stringMatching(/^th/),
        development: expect.stringMatching(/^th/),
    };

    /**
     * 只能在 toEqual 和 toBeCalledWith 里作为参数传入
     */
    it('stringMatching with array', () => {
        // 当直接使用时为严格匹配
        expect([ 'production', 'development', ]).toEqual(expected);
    });

    it('stringMatching with arrayContaining', () => {
        // 非严格匹配 (contain) 使用 arrayContaining API
        expect([ 'production', 'development', 'test', ]).toEqual(expect.arrayContaining(expected));
    });

    it('stringMatching with object', () => {
        // 当直接使用时为严格匹配
        expect({ 'production': 'that', 'development': 'this', }).toEqual(expectedObj);
    });

    it('stringMatching with objectContaining', () => {
        // 非严格匹配 (contain) 使用 arrayContaining API
        expect({
            'production': 'that',
            'development': 'this',
            'test': 'others',
        }).toEqual(expect.objectContaining(expectedObj));
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
