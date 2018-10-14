'use strict';

import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
    strictEqual
} from 'assert';

import DoneCallback = jest.DoneCallback;

describe('axios mock example', () => {
    it('axios request must be mocked', async (done: DoneCallback) => {
        axios.get('');

        const mock: MockAdapter = new MockAdapter(axios);
        const data = 'it\'s ok!';

        mock.onGet(/\/test_uri/).replyOnce(200, data);

        const response = await axios.get('/test_uri');

        strictEqual(response.data, 'it\'s ok!');

        done();
    });
});