'use strict';

import {
    normalLoop,
    returnSth,
    asyncTwoCallback,
    someProcessAsyncFake,
    returnsInstance,
} from '@/example-for-test';

describe('match API', () => {
    /**
     * expect(actual).toBe(expected)
     * 判断运行结果 actual 是否是预期值 expected
     * 为原始值匹配而生
     */
    it('toBe', () => {
        const loopCount: number = 10000;

        expect(normalLoop(loopCount)).toBe(10000);
    });

    /**
     * 为引用值匹配而生 (会遍历引用值的每个子, 来确定结果)
     */
    it('toEqual', () => {
        class A {
            a = 1;
            b = {
                c: 3,
            };
        }

        expect(returnSth('object')).toEqual(new A);
    });

    /**
     * strict 模式会将直接声明的对象与 new 出来的类实例直接视作不同的对象报错
     */
    it('toStrictEqual', () => {
        expect(returnSth('object')).toStrictEqual({
            a: 1,
            b: {
                c: 3,
            },
        });
    });

    it('toThrow', () => {
        expect(() => { throw new Error('wow'); }).toThrow(/^wow$/);
    });

    /**
     * 用来检查是否未定义
     */
    it('toBeDefined', () => {
        expect(returnSth('array')).toBeDefined();
    });

    /**
     * 用于判断是不是 false 型的值
     * false, 0, '', null, undefined, NaN
     */
    it('toBeFalsy', () => {
        expect(returnSth('NaN')).toBeFalsy();
    });

    it('string match with toMatch', () => {
        expect('it\'s a test case').toMatch(/test case$/);
        expect('it\'s a test case').toMatch('test case');
    });

    it('object match with toMatchObject', () => {
        expect({
            balabala: true,
            bilibili: 4,
            duludulu: 'name name name'
        }).toMatchObject({
            balabala: true,
            // 后面会有
            duludulu: expect.stringMatching(/name name/),
        });
    });

    it('object has some property', () => {
        const result = {
            balabala: true,
            bilibili: 4,
            duludulu: 'name name name'
        };

        expect(result).toHaveProperty('balabala', true);
        expect(result).toHaveProperty('bilibili');
    });

    /**
     * 等待 promise 执行完成并从中获得 resolve 的值
     */
    it('resolves', () => {
        return expect(Promise.resolve(true)).resolves.toBe(true);
    });

    /**
     * 等待 promise 执行完成并从中获得 resolve 的值
     */
    it('resolves', () => {
        return expect(Promise.reject(new Error('wow!'))).rejects.toThrow('wow!');
    });

    /**
     * 判断是不是这个类的实例
     */
    it('toBeInstanceOf', () => {
        return expect(returnsInstance(Date)).toBeInstanceOf(Date);
    });

    /**
     * 下面都是用于提升可读性的语义化 API
     * 想用就用吧
     */
    /**
     * 不推荐使用
     * js 的数字计算不准确, 所以数字判断可以用这个
     * 但是比较严谨的业务不推荐使用
     */
    it('toBeCloseTo', () => {
        expect(0.2 + 0.1).toBeCloseTo(0.3, 5);
    });

    it('toBeGreaterThan', () => {
        expect(returnSth('number')).toBeGreaterThan(0);
    });

    it('toBeGreaterThanOrEqual', () => {
        expect(returnSth('number')).toBeGreaterThanOrEqual(1);
    });

    it('toBeLessThan', () => {
        expect(returnSth('number')).toBeLessThan(2);
    });

    it('toBeLessThanOrEqual', () => {
        expect(returnSth('number')).toBeLessThanOrEqual(1);
    });

    it('toBeNull', () => {
        expect(returnSth('null')).toBeNull();
    });

    it('toBeTruthy', () => {
        expect(returnSth('number')).toBeTruthy();
    });

    it('toBeUndefined', () => {
        expect(returnSth('undefined')).toBeUndefined();
    });

    it('toHaveLength', () => {
        expect([ 1, 2, 3, ]).toHaveLength(3);
        expect('abc').toHaveLength(3);
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
     * 是全等判断的, 引用类型不行
     */
    it('contain item', () => {
        expect([ 'a', ]).toContain('a');
    });

    it('contain in string', () => {
        expect('it\'s a test case').toContain('test');
    });

    it('contain check with equal', () => {
        expect([ { a: 1, }, ]).toContainEqual({ a: 1, });
    });

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
