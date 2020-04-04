const Handler = require('../main/Handler');

const QUEUE_NAME = 'queue name';

let channel;
let handler;

beforeEach(() => {
  channel = {
    assertQueue: jest.fn(),
    consume: jest.fn(),
    sendToQueue: jest.fn(),
    ack: jest.fn(),
  };
  handler = new Handler(channel);
});

test('handler asserts queue before start consuming it', () => {
  handler.handle(QUEUE_NAME, jest.fn());

  expect(channel.assertQueue.mock.calls.length).toBe(1);
});
