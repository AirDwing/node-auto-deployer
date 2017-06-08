const http = require('http');
const createHandler = require('./handler');

module.exports = ({ path = '/', host = '0.0.0.0', port = 8888 } = {}) => {
  const handler = createHandler(path);

  http.createServer((req, res) => {
    handler(req, res, () => {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 404 }));
    });
  }).listen(port, host);

  return handler;
};
