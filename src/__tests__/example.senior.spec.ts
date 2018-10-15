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
