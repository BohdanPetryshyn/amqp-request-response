const uuid = require('uuid');

const buildRequestMessage = (payload, correlationId, replyTo) => {
  const message = { correlationId, replyTo, payload };
  return Buffer.from(JSON.stringify(message));
};

module.exports = channel => {
  const callbacks = new Map();
  const replyTo = channel
    .assertQueue('', { exclusive: true })
    .then(queue => queue.queue);

  const popCallback = correlationId => {
    const callback = callbacks.get(correlationId);
    callbacks.delete(correlationId);
    return callback;
  };

  replyTo.then(replyTo => {
    channel.consume(replyTo, msg => {
      const response = JSON.parse(msg.content.toString());
      const callback = popCallback(response.correlationId);
      callback(null, response.payload);
    });
  });

  return (queueName, payload, callback) => {
    const correlationId = uuid.v4();

    replyTo
      .then(replyTo => {
        const requestMessage = buildRequestMessage(
          payload,
          correlationId,
          replyTo
        );
        channel.sendToQueue(queueName, requestMessage);
        callbacks.set(correlationId, callback);
      })
      .catch(error => {
        callbacks.delete(correlationId);
        callback(error);
      });
  };
};
