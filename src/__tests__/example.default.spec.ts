'use strict';

import {
    someProcessAsyncFake,
    twoProcessAsyncFake,
} from '@/test-target';

import {
    promisify,
} from 'util';

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
