'use strict';

/**
 * jest mock 与 es6 import 协同使用
 *
 * 英文版:
 * https://stackoverflow.com/questions/40465047/how-can-i-mock-an-es6-module-import-using-jest/40465435
 * 中文版:
 * http://landcareweb.com/questions/2219/ru-he-shi-yong-jestmo-ni-es6mo-kuai-dao-ru
 *
 * 可以手动替换掉对应的函数, 但是这个会影响到全局所有的引用, 所以最好自己保存下原函数, 用完之后及时恢复
 *
 * 又发现一个问题, 直接替换法对待一般函数都是正常的, 但是在 mock 一个文件中的某个函数时, 同文件中的另一个引用该函数的函数, 并不会感受到 mock
 */

import {
    someProcessAsyncFake,
    twoProcessAsyncFake,
    getANumber,
    random,
} from '@/test-target';

import {
    useRandom,
} from '@/test-target-2';

import negative from '@/test-target';

import * as TestTarget from '@/test-target';

import {
    promisify,
} from 'util';

import SpyInstance = jest.SpyInstance;

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
describe('\n  mock 基础使用及断言 (包装及监控)\n\t', () => {

    it('jest.fn() \n\tmock 某个函数\n\t', () => {
        const mockFn = jest.fn(TestTarget.getANumber);
        // 不会影响函数的正常运行
        expect(mockFn(1)).toEqual(expect.any(Number));
    });

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

    it('在使用 es6 import / export 时使用 mock', () => {
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

    it('mock default export', () => {
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

    it('mock 底层依赖', () => {
        const bakRandom: (input: number) => number = TestTarget.random;

        (TestTarget as any).random = jest.fn((input: number): number => input * 7);

        // 这个并不 ok
        // expect(getANumber(3)).toBe(63);

        useRandom(3);

        expect(TestTarget.random).toBeCalledWith(10);

        (TestTarget as any).random = bakRandom;
    });

    it('试试 spyOn', () => {
        const mockedRandom: SpyInstance<(input: number) => number> = jest.spyOn(TestTarget, 'random');

        mockedRandom.mockImplementation((input: number): number => input * 7);

        expect(jest.isMockFunction(random)).toBeTruthy();

        // 和上方一样的结果, 够不到
        // expect(getANumber(3)).toBe(63);

        jest.restoreAllMocks();

        expect(jest.isMockFunction(random)).toBeFalsy();
    });

    // // 每个用例开始前 restore 整个项目的 mock, 防止用例之间互相影响
    // beforeEach(() => {
    //     // 这个函数的作用是清除内存缓冲区中缓存的 require('xxx') 的内容
    //     // jest.resetModules();
    //     // 一般用法:
    //     // beforeEach(() => { jest.resetModules(); });
    //     // it('xxx', () => { const xxx = require('xxx'); doSth(); })
    //     // it('xxx', () => { const xxx = require('xxx'); doAnotherThing(); })
    //
    //     // jest.restoreAllMocks();
    //     //
    //     // if (jest.isMockFunction(getANumber)) {
    //     //     getANumber.mockRestore();
    //     // }
    // });

    // it('jest.genMockFromModule() \n\tmock 整个模块\n\t', () => {
    //     const examples: any = jest.genMockFromModule('../test-target');
    //     // 这时候重新赋值将会干掉 mock, 所以重新赋值一定要包上 jest.fn
    //     examples.getANumber = jest.fn(() => false);
    //
    //     expect(jest.isMockFunction(examples.getANumber)).toBe(true);
    //     expect(examples.getANumber(1)).toBe(false);
    // });
    //
    // /**
    //  * jest.mock() 会直接上升到顶层, 用 jest.doMock() 将局限在这个代码块中
    //  * jest.mock() 和 jest.doMock() 的第二个参数 factory 在 es6 import / export 模式下不好用
    //  * 所以暂时可以用 赋值替换 和 mockImplementation 两种方法来进行 mock
    //  */
    // it('jest.doMock() \n\t直接 mock 掉整个模块\n\t', () => {
    //     // jest.genMockFromModule() 是返回一个 mock 的引用, jest.mock() 则会直接替换掉原值
    //     jest.doMock('../test-target');
    //
    //     // 下方两行代码相当于这一行
    //     // (TestTarget as any).getANumber = jest.fn(() => 2);
    //
    //     (TestTarget as any).getANumber = jest.fn(TestTarget.getANumber);
    //     // 因为上方 mock 过了, 所以引入模块的实际对象已经变成了一个 mock 函数了
    //     (getANumber as any).mockReturnValue(2);
    //     // 如果按照代码逻辑运行, in 1 不可能 out 2 的
    //     expect(getANumber(1)).toBe(2);
    // });

    // it('.mockImplementation() \n\t直接替换函数的功能\n\t', () => {
    //     jest.doMock('../test-target');
    //
    //     (TestTarget.getANumber as any).mockImplementation((input: number): number => -input);
    //
    //     expect(getANumber(1)).toBe(-1);
    // });

    // it('.mockImplementation() \n\t替换函数依赖的函数\n\t', () => {
    //     // jest.mock('../test-target', () => {
    //     //     return {
    //     //         __esModule: true,
    //     //         random: jest.fn((input: number): number => -input),
    //     //         getANumber: jest.fn((input: number): number => -input),
    //     //     };
    //     // });
    //
    //     // (TestTarget as any).random = jest.fn(TestTarget.random);
    //     //
    //     // (TestTarget.random as any).mockImplementation((input: number): number => -input);
    //     //
    //     // (TestTarget.getANumber as any).mockRestore();
    //
    //     expect(TestTarget.getANumber(8)).toBeGreaterThan(0);
    // });
    //
    // it('.mock.calls & .mock.results \n\t读取入参与返回\n\t', () => {
    //     // expect((returnSth as any).mock.calls).toEqual([
    //     //     [ 'string', ],
    //     //     [ 'number', ],
    //     // ]);
    //     //
    //     // expect((returnSth as any).mock.results).toEqual([
    //     //     { isThrow: false, value: 'foo', },
    //     //     { isThrow: false, value: 'foo', },
    //     // ]);
    // });
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

        const result = await fnP(false);

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

// TODO spy
