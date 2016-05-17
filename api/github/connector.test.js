import { assert } from 'chai';
import { deepEqual } from 'lodash';
import { GitHubConnector } from './connector';

let requestQueue = [];

function mockRequestPromise(requestOptions) {
  // Ensure we expected to get more requests
  assert.notEqual(requestQueue.length, 0);

  const nextRequest = requestQueue.shift();

  // Ensure this is the request we expected
  assert.deepEqual(requestOptions, nextRequest.options);

  return new Promise((resolve, reject) => {
    if (nextRequest.result) {
      resolve(nextRequest.result);
    } else if (nextRequest.error) {
      reject(nextRequest.error);
    } else {
      throw new Error('Mocked request must have result or error.');
    }
  });
}

function pushMockRequest({ options, result, error }) {
  const defaultOptions = {
    json: true,
  };

  options.uri = 'https://api.github.com' + options.uri;

  requestQueue.push({
    options: {
      ...options,
      ...defaultOptions,
    },
    result,
    error,
  });
}

GitHubConnector.__mockRequestPromise = mockRequestPromise;

describe('GitHub connector', () => {
  beforeEach(() => {
    requestQueue = [];
  });

  afterEach(() => {
    assert.equal(requestQueue.length, 0);
  });

  it('can be constructed', () => {
    assert.isOk(new GitHubConnector());
  });

  it('can load one endpoint', () => {
    const connector = new GitHubConnector();

    pushMockRequest({
      options: { uri: '/endpoint' },
      result: { id: 1 },
    });

    return connector.get('/endpoint').then((result) => {
      assert.deepEqual(result, { id: 1 });
    });
  });
});
