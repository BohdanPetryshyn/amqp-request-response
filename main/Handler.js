module.exports = class Handler {
  constructor(channel) {
    this.channel = channel;
  }

  async handle(queueName, handler) {
    await this.channel.assertQueue(queueName);
    this.channel.consume(queueName, msg => {
      const request = JSON.parse(msg.content);

      handler(request.payload, (error, response) => {
        const responseMessage = error
          ? Handler.buildResponseMessage(request.correlationId, error)
          : Handler.buildResponseMessage(request.correlationId, response);
        this.channel.sendToQueue(request.replyTo, responseMessage);
        this.channel.ack(msg);
      });
    });
  }

  static buildResponseMessage(correlationId, payload) {
    const message = { correlationId, payload };
    return Buffer.from(JSON.stringify(message));
  }
};
