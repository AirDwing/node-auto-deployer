import http from 'http';
import createHandler from './handler';

module.exports = (projects = [], { path = '/', host = '0.0.0.0', port = 8888 }) => {
  if (typeof projects !== 'object' || !projects[0] || typeof projects[0] !== 'object') {
    throw new Error('Invalid Project Config');
  }
  const handler = createHandler(path);

  http.createServer((req, res) => {
    handler(req, res, () => {
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 404 }));
    });
  }).listen(port, host);

  return handler;
};
