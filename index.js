const request = require('./request');
const handle = require('./handle');

module.exports = channel => ({
  request: request(channel),
  handle: handle(channel),
});
