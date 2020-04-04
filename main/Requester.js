const uuid = require('uuid');

module.exports = class Requester {
  constructor(channel) {
    this.callbacks = new Map();
    this.channel = channel;
    this.initializeResponseQueue();
  }

  initializeResponseQueue() {
    this.replyTo = this.channel
      .assertQueue('', { exclusive: true })
      .then(queue => queue.queue);
    this.replyTo.then(replyTo =>
      this.channel.consume(replyTo, this.consumeResponse)
    );
  }

  consumeResponse = msg => {
    const response = JSON.parse(msg.content.toString());
    const callback = this.popCallback(response.correlationId);
    callback(null, response.payload);
  };

  popCallback(correlationId) {
    const callback = this.callbacks.get(correlationId);
    this.callbacks.delete(correlationId);
    return callback;
  }

  request(queueName, payload, callback) {
    const correlationId = uuid.v4();

    this.replyTo
      .then(replyTo => {
        const requestMessage = Requester.buildRequestMessage(
          payload,
          correlationId,
          replyTo
        );
        this.channel.sendToQueue(queueName, requestMessage);
        this.callbacks.set(correlationId, callback);
      })
      .catch(error => {
        this.callbacks.delete(correlationId);
        callback(error);
      });
  }

  static buildRequestMessage(payload, correlationId, replyTo) {
    const message = { correlationId, replyTo, payload };
    return Buffer.from(JSON.stringify(message));
  }
};
