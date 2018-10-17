'use strict';

/**
 * jest mock 与 es6 import 协同使用
 *
 * 英文版:
 * https://stackoverflow.com/questions/40465047/how-can-i-mock-an-es6-module-import-using-jest/40465435
 * 中文版:
 * http://landcareweb.com/questions/2219/ru-he-shi-yong-jestmo-ni-es6mo-kuai-dao-ru
 *
 * 文章大意:
 * 可以手动替换掉对应的函数, 但是这个会影响到全局所有的引用, 所以最好自己保存下原函数, 用完之后及时恢复
 *
 * 注意:
 * 直接替换法对待一般函数都是正常的, 但是有一种例外情况:
 *
 * alpha.ts
 * ```
 * export function a () {
 *     // do sth ...
 * }
 *
 * export function b () {
 *     a();
 *     // do sth ...
 * }
 * ```
 *
 * beta.ts
 * ```
 * import { a, } from './alpha';
 *
 * export function c () {
 *     a();
 *     // do sth ...
 * }
 * ```
 *
 * test.spec.ts
 * ```
 * import { a, b, } from '../alpha';
 * import { c, } from '../beta';
 *
 * describe('mock test', () => {
 *     it('same module function mock', () => {
 *         // mock code ...
 *
 *         b();
 *         // 报错, 因为 mock 不生效, 没有调用到被 mock 函数, mock 计数为 0
 *         expect(a).toHaveBeenCalled();
 *     });
 *
 *     it('different module function mock', () => {
 *         // mock code ...
 *
 *         c();
 *         // 通过
 *         expect(a).toHaveBeenCalled();
 *     });
 * });
 * ```
 *
 * 原因可能是因为 mock 的原理是修改 exports 对象上的引用, 而模块内部互调直接使用的名称, 跳过了这一步, 所以无能为力.
 */

/**
 * axios mock 工具:
 * https://github.com/ctimmerm/axios-mock-adapter
 */

import {
    someProcessAsyncFake,
    twoProcessAsyncFake,
    getANumber,
    random,
} from '@/test-target.jest';

import {
    useRandom,
} from '@/test-target.jest2';

import negative from '@/test-target.jest';

import * as TestTarget from '@/test-target.jest';

import {
    promisify,
} from 'util';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import SpyInstance = jest.SpyInstance;
import DoneCallback = jest.DoneCallback;

describe('\n  基础字段内容匹配\n\t', () => {
    it('.toBe() \n\t值判断 (其实就是 === 的语法糖)\n\t', () => {
        expect(1 + 1).toBe(2);
    });

    it('.toMatch() \n\t用于字符串匹配 (部分匹配)\n\t', () => {
        expect('it\'s a test case').toMatch(/test case$/);
        expect('it\'s a test case').toMatch('test case');
    });

    it('.toEqual() \n\t递归匹配 (引用值类型会进行遍历， 原始值类型会使用 === 进行对比)\n\t', () => {
        const origin: object = {
            a: 1,
            b: {
                c: 2,
            },
        };
        // 虽然 ... 是浅拷贝, 但意思就是那个意思
        expect({ ...origin, }).toEqual(origin);
    });

    it('.toMatchObject() \n\t用于对象的匹配 (部分匹配)\n\t', () => {
        expect({
            balabala: true,
            bilibili: 4,
            duludulu: 'name name name',
        }).toMatchObject({
            balabala: true,
            // 后面会有
            duludulu: expect.stringMatching(/name name/),
        });
    });

    it('.toThrow() \n\t用于接住函数运行抛出的错误 (如果不抛出错误就会报错)\n\t', () => {
        expect(() => { throw new Error('wow'); }).toThrow(/^wow$/);
    });

    it('.not \n\t用于对结果取反\n\t', () => {
        expect(1 + 1).not.toBe(3);
    });

    // 因为测试用例是 promise 的, 所以要么使用 async 修饰用例
    it('.resolves \n\t修饰用于拆包 Promise.resolve()\n\t', async (): Promise<any> => {
        await expect(Promise.resolve(true)).resolves.toBe(true);
    });

    // 要么 return Promise
    it('.rejects \n\t修饰用于拆包 Promise.reject()\n\t', () => {
        return expect(Promise.reject(new Error('wow!'))).rejects.toThrow('wow!');
    });

    it('.toContain() \n\t内容存在判断\n\t', () => {
        expect([ 'a', ]).toContain('a');
    });

    it('.toContain() \n\t也可用于判断子字符串是否存在于字符串中\n\t', () => {
        expect('it\'s a test case').toContain('test');
    });

    it('.toContainEqual() \n\t在判断是否有该子项时使用 equal 判断\n\t', () => {
        expect([ { a: 1, }, ]).toContainEqual({ a: 1, });
    });
});

describe('\n  子内容通配匹配 (只能在 toEqual 和 toBeCalledWith 里作为参数传入)\n\t', () => {
    it('.anything() \n\t匹配任意非空值\n\t', () => {
        expect('a').toEqual(expect.anything());
    });

    it('.any() \n\t匹配某类型任意值\n\t', () => {
        expect(1).toEqual(expect.any(Number));
    });

    const expected = [
        expect.stringMatching(/^prod/),
        expect.stringMatching(/^dev/),
    ];

    const expectedObj = {
        production: expect.stringMatching(/^th/),
        development: expect.stringMatching(/^th/),
    };

    it('.stringMatching() \n\t字符串匹配 & 数组\n\t', () => {
        // 当直接使用时为严格匹配
        expect([ 'production', 'development', ]).toEqual(expected);
    });

    it('.stringMatching() \n\t字符串匹配 & 对象\n\t', () => {
        // 当直接使用时为严格匹配
        expect({ 'production': 'that', 'development': 'this', }).toEqual(expectedObj);
    });

    it('.arrayContaining() \n\t匹配数组中是否包括这些子元素\n\t', () => {
        expect([ 'a', 'b', 'c', ]).toEqual(expect.arrayContaining([ 'b', 'c', ]));
    });

    it('.stringMatching() 与 .arrayContaining() 联合使用\n\t', () => {
        expect([ 'production', 'development', 'test', ]).toEqual(expect.arrayContaining(expected));
    });

    it('.objectContaining() \n\t匹配对象结构\n\t', () => {
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

    it('.stringMatching() 与 .objectContaining() 联合使用\n\t', () => {
        expect({
            'production': 'that',
            'development': 'this',
            'test': 'others',
        }).toEqual(expect.objectContaining(expectedObj));
    });

    it('.stringContaining() \n\t匹配字符串片段\n\t', () => {
        expect('it\'s a test case').toEqual(expect.stringContaining('test'));
    });
});

/**
 * mock 的本质就是劫持某个函数, 并对其执行进行某些特定的处理 (监听 / 修改返回 / 统计)
 */
describe('\n  mock 基础使用 (包装)\n\t', () => {

    it('jest.fn() \n\tmock 某个函数\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        // 不会影响函数的正常运行
        expect(mockFn(1)).toBeLessThan(2);
    });

    it('.mockImplementation() \n\t修改 mock 行为\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);

        expect(mockFn(1)).toBeLessThan(2);

        mockFn.mockImplementation((input: number): number => -input);

        expect(mockFn(1)).toBe(-1);

        // 相似的还有 .mockImplementationOnce(), 看名字就懂了, 不多介绍了
    });

    it('.mockReturnValue() \n\t修改 mock 函数返回值\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);

        expect(mockFn(1)).toBeLessThan(2);

        mockFn.mockReturnValue(6);

        expect(mockFn(1)).toBe(6);

        // 相似的还有 .mockReturnValueOnce(), 看名字就懂了, 不多介绍了
    });

    it('.mockResolvedValue() \n\t修改 mock resolve 的值\n\t', async () => {
        const mockFn = jest.fn((input: number) => Promise.resolve(input * 2));

        await expect(mockFn(1)).resolves.toBe(2);

        mockFn.mockResolvedValue(3);

        await expect(mockFn(1)).resolves.toBe(3);

        // 相似的还有 .mockResolvedValueOnce(), 看名字就懂了, 不多介绍了
    });

    it('.mockRejectedValue() \n\t修改 mock reject 的值\n\t', async () => {
        const mockFn = jest.fn((content: string) => Promise.reject(new Error(content)));

        await expect(mockFn('yes')).rejects.toThrow('yes');

        mockFn.mockRejectedValue(new Error('no'));

        await expect(mockFn('yes')).rejects.toThrow('no');

        // 相似的还有 .mockResolvedValueOnce(), 看名字就懂了, 不多介绍了
    });

    it('.mock.calls & .mock.results \n\t读取入参与返回\n\t', () => {
        const mockFn = jest.fn((content: string) => `input: ${content}`);

        mockFn('string');
        mockFn('what');

        expect(mockFn.mock.calls).toEqual([
            [ 'string', ],
            [ 'what', ],
        ]);

        expect(mockFn.mock.results).toEqual([
            { isThrow: false, value: 'input: string', },
            { isThrow: false, value: 'input: what', },
        ]);
    });
});

describe('\n  mock 相关判断函数\n\t', () => {
    it('jest.isMockFunction() \n\t判断一个函数是否是 mock\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);

        expect(jest.isMockFunction(mockFn)).toBe(true);
    });

    it('.toHaveBeenCalled() \n\t判断 mock 函数是否被调用\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        mockFn(1);
        expect(mockFn).toHaveBeenCalled();
    });

    it('.toHaveBeenCalledTimes() \n\t统计 mock 函数被调次数\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        mockFn(1);
        mockFn(1);
        expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('.toHaveBeenCalledWith() \n\t统计 mock 函数调用参数\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        mockFn(1);
        expect(mockFn).toHaveBeenCalledWith(1);

        // 除此之外还有
        // .toHaveBeenLastCalledWith() .toHaveBeenNthCalledWith()
        // 功能差不多, 不再赘述
    });

    it('.toHaveReturned() \n\t判断 mock 函数是否有返回\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        mockFn(1);
        expect(mockFn).toHaveReturned();
    });

    it('.toHaveReturnedTimes() \n\t统计 mock 函数有返回值次数\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        mockFn(1);
        mockFn(1);
        expect(mockFn).toHaveReturnedTimes(2);
    });

    it('.toHaveReturnedWith() \n\t统计 mock 函数调用参数\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        mockFn(0);
        expect(mockFn).toHaveReturnedWith(0);

        // 除此之外还有
        // .toHaveLastReturnedWith() .toHaveNthReturnedWith()
        // 功能差不多, 不再赘述
    });
});

/**
 * 但是 jest.fn() 的包装只能在直接调用时使用, 当我想 mock 一个函数内部调用的其他函数时该怎么办呢?
 */
describe('\n  mock 进阶使用\n\t', () => {

    it('在使用 es6 import / export 时使用 mock\n\t', () => {
        // 保存原方法
        const bakGetANumber: (input: number) => number = TestTarget.getANumber;

        // 为了能够对 import 进行赋值, 所以使用 `TestTarget as any`
        (TestTarget as any).getANumber = jest.fn((input: number): number => input * 7);

        // 校验返回值
        expect(getANumber(1)).toBe(7);

        // 校验状态目前确实已被 mock
        expect(jest.isMockFunction(TestTarget.getANumber)).toBeTruthy();
        expect(jest.isMockFunction(getANumber)).toBeTruthy();

        // 还原现场
        (TestTarget as any).getANumber = bakGetANumber;

        // 校验状态目前确实没被 mock
        expect(jest.isMockFunction(TestTarget.getANumber)).toBeFalsy();
        expect(jest.isMockFunction(getANumber)).toBeFalsy();
    });

    it('mock default export\n\t', () => {
        // 保存原方法
        const bakDefault: (input: number) => number = TestTarget.default;

        // 为了能够对 import 进行赋值, 所以使用 `TestTarget as any`
        (TestTarget as any).default = jest.fn((input: number): number => input * 7);

        // 校验返回值
        expect(negative(1)).toBe(7);

        // 校验状态目前确实已被 mock
        expect(jest.isMockFunction(TestTarget.default)).toBeTruthy();
        expect(jest.isMockFunction(negative)).toBeTruthy();
        // 还原现场
        (TestTarget as any).default = bakDefault;

        // 校验状态目前确实没被 mock
        expect(jest.isMockFunction(TestTarget.default)).toBeFalsy();
        expect(jest.isMockFunction(negative)).toBeFalsy();
    });

    it('mock 底层依赖 (不同文件内函数互调 ok, 同文件内函数互调不会被 mock)\n\t', () => {
        const bakRandom: (input: number) => number = TestTarget.random;

        (TestTarget as any).random = jest.fn((input: number): number => input * 7);

        // 这个并不 ok (内部引用)
        // expect(getANumber(3)).toBe(63);

        // 外部引用是 ok 的
        expect(useRandom(3)).toBe(70);

        expect(TestTarget.random).toBeCalledWith(10);

        (TestTarget as any).random = bakRandom;
    });

    it('通过 spyOn 进行 mock (不同文件内函数互调 ok, 同文件内函数互调不会被 mock)\n\t', () => {
        const mockedRandom: SpyInstance<(input: number) => number> = jest.spyOn(TestTarget, 'random');

        mockedRandom.mockImplementation((input: number): number => input * 7);

        expect(jest.isMockFunction(random)).toBeTruthy();

        // 和上方一样的结果, 够不到
        // expect(getANumber(3)).toBe(63);

        // 和上方一样, 外部引用 ok
        expect(useRandom(3)).toBe(70);

        jest.restoreAllMocks();

        expect(jest.isMockFunction(random)).toBeFalsy();
    });
});

describe('\n  基础字段内容匹配 的 一些语法糖\n\t', () => {
    it('.toBeInstanceOf() \n\t判断是不是某个类的实例\n\t', () => {
        return expect(new Date).toBeInstanceOf(Date);
    });

    it('.toBeDefined() \n\t检查是否定义\n\t', () => {
        expect(1).toBeDefined();
    });

    it('.toBeFalsy() \n\t判断是不是 false 型的值\n\t', () => {
        // falsy 型的值包括 false, 0, '', null, undefined, NaN
        expect(NaN).toBeFalsy();
    });

    it('.toStrictEqual() \n\t会严格区分字面对象与类对象 (为了顺利运行, 断言加了 not)\n\t', () => {
        class A {
            a = 1;
            b = {
                c: 3,
            };
        }

        expect(new A).not.toStrictEqual({
            a: 1,
            b: {
                c: 3,
            },
        });
    });

    it('.toHaveProperty() \n\t校验对象是否存在该属性\n\t', () => {
        const result = {
            foo: true,
            bar: 4,
            boo: 'name name name',
        };

        expect(result).toHaveProperty('foo', true);
        expect(result).toHaveProperty('bar');
    });

    it('.toBeCloseTo() \n\t四舍五入判断值\n\t', () => {
        expect(0.2 + 0.1).toBeCloseTo(0.3, 5);
    });

    it('.toBeGreaterThan() \n\t大于\n\t', () => {
        expect(1).toBeGreaterThan(0);
    });

    it('.toBeGreaterThanOrEqual() \n\t大于等于\n\t', () => {
        expect(1).toBeGreaterThanOrEqual(1);
    });

    it('.toBeLessThan() \n\t小于\n\t', () => {
        expect(1).toBeLessThan(2);
    });

    it('.toBeLessThanOrEqual() \n\t小于等于\n\t', () => {
        expect(1).toBeLessThanOrEqual(1);
    });

    it('.toBeTruthy() \n\t为真\n\t', () => {
        expect(888).toBeTruthy();
    });

    it('.toBeNull() \n\t为 null\n\t', () => {
        expect('123'.match(/abc/)).toBeNull();
    });

    it('.toBeUndefined() \n\t为 undefined\n\t', () => {
        expect([ 1, 2, 3, ].find(item => 3 < item)).toBeUndefined();
    });

    it('.toHaveLength() \n\t判断长度\n\t', () => {
        expect([ 1, 2, 3, ]).toHaveLength(3);
        expect('abc').toHaveLength(3);
    });
});

/**
 * 官网的 demo 不对, 这个必须做成 await / async 或者 return promise
 * 要不然不会等待 callback 执行
 */
describe('\n  断言执行统计\n\t', () => {

    it('.hasAssertions() \n\t判断是否有执行断言\n\t', async () => {
        expect.hasAssertions();

        const fnP: (willError: boolean) => Promise<any> = promisify(someProcessAsyncFake);

        const result: object = await fnP(false);

        expect(result).toEqual({
            msg: 'ok'
        });
    });

    it('.assertions() \n\t统计断言执行次数\n\t', async () => {
        expect.assertions(2);

        await twoProcessAsyncFake([
            () => {
                expect(true).toBeTruthy();
            },
            () => {
                expect(true).toBeTruthy();
            },
        ]);
    });
});

describe('\n  使用第三方组件对 axios 进行 mock\n\t', () => {
    it('.onGet() \n\tmock get 方法\n\t', async (done: DoneCallback) => {
        const mock: MockAdapter = new MockAdapter(axios);
        const data: string = 'it\'s ok!';
        // 通过 onGet 指定对哪个 uri 请求进行 mock
        mock.onGet(/\/test_uri/).replyOnce(200, data);

        const response = await axios.get('/test_uri');

        expect(response.data).toBe('it\'s ok!');

        done();
    });
});
