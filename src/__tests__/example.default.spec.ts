'use strict';

import {returnsInstance, returnSth} from "@/example-for-test";

describe('基础字段内容匹配', () => {
    it('.toBe 值判断 (其实就是 === 的语法糖)', () => {
        expect(1 + 1).toBe(2);
    });

    it('.toMatch 用于字符串匹配 (部分匹配)', () => {
        expect('it\'s a test case').toMatch(/test case$/);
        expect('it\'s a test case').toMatch('test case');
    });

    it('.toEqual 递归匹配 (引用值类型会进行遍历， 原始值类型会使用 === 进行对比)', () => {
        const origin: object = {
            a: 1,
            b: {
                c: 2,
            },
        };
        // 虽然 ... 是浅拷贝, 但意思就是那个意思
        expect({ ...origin, }).toEqual(origin);
    });

    it('.toMatchObject 用于对象的匹配 (部分匹配)', () => {
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

    it('.toThrow 用于接住函数运行抛出的错误 (如果不抛出错误就会报错)', () => {
        expect(() => { throw new Error('wow'); }).toThrow(/^wow$/);
    });

    it('.resolves 修饰用于拆包 Promise.resolve()', () => {
        return expect(Promise.resolve(true)).resolves.toBe(true);
    });

    it('.rejects 修饰用于拆包 Promise.resolve()', () => {
        return expect(Promise.reject(new Error('wow!'))).rejects.toThrow('wow!');
    });
});

describe('基础字段内容匹配 的 一些语法糖', () => {
    it('.toBeInstanceOf 判断是不是某个类的实例', () => {
        return expect(new Date).toBeInstanceOf(Date);
    });

    it('.toBeDefined 检查是否定义', () => {
        expect(1).toBeDefined();
    });

    it('.toBeFalsy 判断是不是 false 型的值', () => {
        // falsy 型的值包括 false, 0, '', null, undefined, NaN
        expect(NaN).toBeFalsy();
    });

    it('.toStrictEqual 会严格区分字面对象与类对象 (为了顺利运行, 断言加了 not)', () => {
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

    it('.toHaveProperty 校验对象是否存在该属性', () => {
        const result = {
            foo: true,
            bar: 4,
            boo: 'name name name',
        };

        expect(result).toHaveProperty('foo', true);
        expect(result).toHaveProperty('bar');
    });

    it('.toBeCloseTo 四舍五入判断值', () => {
        expect(0.2 + 0.1).toBeCloseTo(0.3, 5);
    });

    it('.toBeGreaterThan', () => {
        expect(returnSth('number')).toBeGreaterThan(0);
    });

    it('.toBeGreaterThanOrEqual', () => {
        expect(returnSth('number')).toBeGreaterThanOrEqual(1);
    });

    it('.toBeLessThan', () => {
        expect(returnSth('number')).toBeLessThan(2);
    });

    it('.toBeLessThanOrEqual', () => {
        expect(returnSth('number')).toBeLessThanOrEqual(1);
    });

    it('.toBeNull', () => {
        expect(returnSth('null')).toBeNull();
    });

    it('.toBeTruthy', () => {
        expect(returnSth('number')).toBeTruthy();
    });

    it('.toBeUndefined', () => {
        expect(returnSth('undefined')).toBeUndefined();
    });

    it('.toHaveLength', () => {
        expect([ 1, 2, 3, ]).toHaveLength(3);
        expect('abc').toHaveLength(3);
    });
});
