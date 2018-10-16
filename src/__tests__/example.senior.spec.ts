'use strict';

/**
 * axios mock 工具文档:
 * https://github.com/ctimmerm/axios-mock-adapter
 *
 * vue ui 测试工具中文文档:
 * https://vue-test-utils.vuejs.org/zh/
 */

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
    shallowMount,
} from '@vue/test-utils';
import HelloWorld from '@/components/HelloWorld.vue';

import assert, {
    strictEqual,
} from 'assert';

import {
    returnsInput,
    someProcessAsyncFake,
    asyncTwoCallback,
} from '../example-for-test';

import DoneCallback = jest.DoneCallback;

describe('axios mock example', () => {
    it('axios request must be mocked', async (done: DoneCallback) => {
        const mock: MockAdapter = new MockAdapter(axios);
        const data = 'it\'s ok!';
        // 通过 onGet 指定对哪个 uri 请求进行 mock
        mock.onGet(/\/test_uri/).replyOnce(200, data);

        const response = await axios.get('/test_uri');

        strictEqual(response.data, 'it\'s ok!');

        done();
    });
});

describe('HelloWorld.vue', () => {
    it('renders props.msg when passed', () => {
        const msg = 'new message';
        const wrapper = shallowMount(HelloWorld, {
            propsData: { msg },
        });
        // vue 官方推荐的 jest 断言判断
        expect(wrapper.text()).toMatch(msg);

        assert((new RegExp(msg)).test(wrapper.text()));
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

    // TODO 找个生命合并的方法

    (expect(100) as any).toBeWithinRange(90, 110);
    (expect(101).not as any).toBeWithinRange(0, 100);
});

// TODO 写 mock 的时候用
// 这个东西可以包裹函数进行监听和 mock
// describe('jest.fn', () => {});

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
