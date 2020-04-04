const buildResponseMessage = (correlationId, payload) => {
  const message = { correlationId, payload };
  return Buffer.from(JSON.stringify(message));
};

module.exports = channel => {
  return async (queueName, handler) => {
    await channel.assertQueue(queueName);
    channel.consume(queueName, msg => {
      const request = JSON.parse(msg.content);

      handler(request.payload, (error, response) => {
        const responseMessage = error
          ? buildResponseMessage(request.correlationId, error)
          : buildResponseMessage(request.correlationId, response);
        channel.sendToQueue(request.replyTo, responseMessage);
        channel.ack(msg);
      });
    });
  };
};
