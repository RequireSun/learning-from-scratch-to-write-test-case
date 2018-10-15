'use strict';

import assert, {
    strictEqual,
    notStrictEqual,
    deepStrictEqual,
    notDeepStrictEqual,
    ifError,
    throws,
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

const version: number = +(((process.version || '').match(/^v(\d+)\./) || [ undefined, '0', ]) as any[])[1];

describe('normal test case with no asserts', () => {
    it('do sth', () => {
        const loopCount: number = 10000;

        normalLoop(loopCount);
    });

    it('fail the case with new Error', () => {
        const loopCount: number = 10000;

        const result: number = normalLoop(loopCount);

        if (9999 < result) {
            // 直接 throw 就能报错了, 不好看, 我给注释掉了
            // throw new Error('really throw!');
        }
    });
});

describe('normal test case with asserts', () => {
    it('simplest assert', () => {
        const loopCount: number = 10000;
        const result: number = normalLoop(loopCount);
        // assert 函数内的值为 "真" 时才会通过
        assert(result === loopCount, 'result must be 10000');
    });

    it('assert to judge is variable an Error', () => {
        const result: any = new Error('test');
        // 判断某个变量是不是 Error
        assert(result instanceof Error, 'result must be 10000');
    });

    it('compare values with equal API', () => {
        const loopCount: number = 10000;
        const result: number = normalLoop(loopCount);
        // 前方值与后方值相同时才会通过 (strict 模式下为 === 匹配)
        strictEqual(result, loopCount, 'result must be 10000');
    });

    it('compare values with equal API', () => {
        let i: number = 0;
        // 不相等才 ok
        notStrictEqual(i, ++i);
    });

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

    it('fail', async () => {
        const result: boolean = someProcessSyncFake();

        // some judgement
        if (!result) {
            assert.fail('result of the process not correct!');
        }
    });

    // 用来判断当前值是否是 error (其实只要非空就会报错), 一般用在 async 函数的回调中
    it('ifError to judge is the async function returns error', () => {
        someProcessAsyncFake(false, (err?: Error, data?: any) => {
            ifError(err);
        });
    });


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

describe('async tests', () => {
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
        // Node v10 新增
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
