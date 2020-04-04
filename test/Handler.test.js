const Handler = require('../main/Handler');

describe('Handler', () => {
  const QUEUE_NAME = 'queue name';
  const REQUEST_PAYLOAD = 'test request payload';
  const REQUEST = {
    payload: REQUEST_PAYLOAD,
    correlationId: 'test correlationID',
    replyTo: 'test replyTo',
  };
  const REQUEST_MSG = { content: Buffer.from(JSON.stringify(REQUEST)) };

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

  it('provides request payload to the request handler', async () => {
    channel.consume.mockImplementation((queueName, consumer) =>
      consumer(REQUEST_MSG)
    );
    const requestHandler = jest.fn();

    await handler.handle(QUEUE_NAME, requestHandler);

    expect(requestHandler.mock.calls[0][0]).toBe(REQUEST_PAYLOAD);
  });
});
