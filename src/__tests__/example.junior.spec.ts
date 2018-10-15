'use strict';

/**
 * node.js 断言官方文档:
 * https://nodejs.org/dist/latest-v10.x/docs/api/assert.html
 *
 * node.js 断言中文文档 (部分翻译):
 * http://nodejs.cn/api/assert.html
 */

import assert, {
    strictEqual,
    notStrictEqual,
    deepStrictEqual,
    notDeepStrictEqual,
    ifError,
    throws,
    fail,
    // Node v10 新增
    // rejects,
} from 'assert';

import DoneCallback = jest.DoneCallback;

import {
    normalLoop,
    formatDate,
    ArrayDataItem,
    someProcessSyncFake,
    someProcessAsyncFake,
} from '@/example-for-test';

import {
    promisify,
} from 'util';

/**
 * node js 大版本号
 * @type {number}
 */
const version: number = +(((process.version || '').match(/^v(\d+)\./) || [ undefined, '0', ]) as any[])[1];

/**
 * 普通测试用例 (无断言)
 */
describe('normal test case with no asserts', () => {
    /**
     * 直接运行
     * 抛出 error 即代表用例不通过
     */
    it('do sth', () => {
        const loopCount: number = 10000;

        normalLoop(loopCount);
    });

    /**
     * 直接运行
     * 抛出 error 即代表用例不通过
     */
    it('fail the case with new Error', () => {
        const loopCount: number = 10000;

        const result: number = normalLoop(loopCount);

        if (9999 < result) {
            // 直接 throw 就能报错了, 不好看, 我给注释掉了
            // throw new Error('really throw!');
        }
    });
});

/**
 * 基础断言应用
 */
describe('normal test case with asserts', () => {
    /**
     * 基础断言: assert(value[, message])
     * value 值为真即通过
     */
    it('simplest assert', () => {
        const loopCount: number = 10000;
        const result: number = normalLoop(loopCount);
        // assert 函数内的值为 "真" 时才会通过
        assert(result === loopCount, 'result must be 10000');
    });

    /**
     * 同样也可使用 assert 来判断变量是否是 Error 对象
     */
    it('assert to judge is variable an Error', () => {
        const result: any = new Error('test');
        // 判断某个变量是不是 Error
        assert(result instanceof Error, 'result must be 10000');
    });

    /**
     * 全等断言: strictEqual(actual, expected[, message])
     * actual 值和 expected 值全等即可通过
     * 相当于 assert(actual === expected)
     */
    it('compare values with equal API', () => {
        const loopCount: number = 10000;
        const result: number = normalLoop(loopCount);
        // 前方值与后方值相同时才会通过 (strict 模式下为 === 匹配)
        strictEqual(result, loopCount, 'result must be 10000');
    });

    /**
     * 不全等断言: notStrictEqual(actual, expected[, message])
     * actual 值和 expected 值不全等即可通过
     * 相当于 assert(actual !== expected)
     */
    it('compare values with equal API', () => {
        let i: number = 0;
        // 不相等才 ok
        notStrictEqual(i, ++i);
    });

    /**
     * 深度匹配: deepStrictEqual(actual, expected[, message])
     * actual 值和 expected 值经深度遍历, 每一个可枚举的原始值 (number | string | boolean | undefined | null) 都相同即可通过
     */
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

    /**
     * 深度不等匹配: notDeepStrictEqual(actual, expected[, message])
     * actual 值和 expected 值经深度遍历, 只要存在一个可枚举不相等的原始值 (number | string | boolean | undefined | null) 即可通过
     */
    it('object deep comparison', () => {
        const origin: ArrayDataItem[] = [{
            timestamp: 1538352000000,
        }, {
            timestamp: 1539129600000,
        }, {
            // 2018-10-15
            timestamp: 1539561600000,
        }, ];

        const milestone: Date = new Date('2018-10-14');

        const result: ArrayDataItem[] = origin.filter((item: ArrayDataItem) => {
            return item.timestamp > +milestone;
        });

        notDeepStrictEqual(result, origin, 'the filter must filtered some items');
    });

    /**
     * 直接报错: fail([message])
     * 如果用例能够运行到这一句, 就会直接报错
     */
    it('fail', async () => {
        const result: boolean = someProcessSyncFake(true);

        // some judgement
        if (!result) {
            fail('result of the process not correct!');
        }
    });

    /**
     * 是否存在 error: ifError(value)
     * 实际作用并不如函数字面含义那样用来判断是否是 error 的,
     * 而是放在 async 函数的回调中用来判断当前值是否是 error (其实只要非空就会报错)
     */
    it('ifError to judge is the async function returns error', () => {
        someProcessAsyncFake(false, (err?: Error, data?: any) => {
            ifError(err);
        });
    });

    /**
     * 是否抛出错误: throws(fn[, error][, message])
     * 用来判断某段代码是否会按照预期抛出预期的 error
     */
    it('throws to judge is the function rejects an error', () => {
        throws(() => {
            throw new Error('Wrong value');
        }, /Wrong/);

        throws(() => {
            const err: TypeError = new TypeError('Wrong value');
            (err as any).code = 404;
            (err as any).foo = 'bar';
            (err as any).info = {
                nested: true,
                baz: 'text'
            };

            throw err;
        }, (err: Error) => {
            assert(/^TypeError$/.test(err.name));
            assert(/Wrong/.test(err.message));
            strictEqual((err as any).foo, 'bar');
            deepStrictEqual((err as any).info, {
                nested: true,
                baz: 'text',
            });
            // 不 return true 就炸了
            return true;
        });
    });
});

/**
 * 异步函数的测试
 */
describe('async tests', () => {
    /**
     * it 函数回调中 done 的使用
     * 异步函数, 调用 done 即表示用例通过
     * 调用 done.fail([message]) 即表示用例不通过
     */
    it('async with done', async (done: DoneCallback) => {
        someProcessAsyncFake(false, (err?: Error) => {
            if (!err) {
                done();
            } else {
                done.fail('async failed!');
            }
        });
    });

    if (10 <= version) {
        /**
         * 是否 reject error: rejects(asyncFn[, error][, message])
         * Node v10 新增
         * 用来判断某段代码是否会按照预期 reject(error)
         */
        it('async functions use `rejects` assert', async () => {
            await assert.rejects(async () => {
                throw new TypeError('Wrong value');
            }, {
                name: 'TypeError',
                message: 'Wrong value',
            });
        });

        it('async functions use `rejects` assert', async () => {
            await assert.rejects(async () => {
                // 我把原来的回调包装成了 promise, 这个 API 从 v8.0.0 开始提供
                const promised = promisify(someProcessAsyncFake);
                // 返回 promise, 传入 true 在函数内部会导致 return error
                return promised(true);
            }, {
                name: 'Error',
                message: 'process error!',
            });
        })
    }
});
