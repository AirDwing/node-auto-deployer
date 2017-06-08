const { EventEmitter } = require('events');
const bl = require('bl');


module.exports = (path) => {
  // make it an EventEmitter, sort of
  const handler = (req, res, callback) => {
    if (req.url.split('?').shift() !== path) {
      return callback();
    }

    const hasError = (msg) => {
      res.writeHead(400, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: msg }));
      const err = new Error(msg);
      handler.emit('error', err, req);
      callback(err);
    };

    req.pipe(bl((err, data) => {
      if (err) {
        return hasError(err.message);
      }
      let obj;
      try {
        obj = JSON.parse(data.toString());
      } catch (e) {
        return hasError(e);
      }

      // invalid json
      if (!obj) {
        return hasError(`received invalid data from ${req.headers.host}, returning 400`);
      }

      res.writeHead(200, { 'content-type': 'application/json' });
      res.end('{"ok":true}');

      const eventKind = obj.event;
      const emitData = {
        event: eventKind,
        payload: obj,
        protocol: req.protocol,
        host: req.headers.host,
        url: req.url
      };

      handler.emit(eventKind, emitData);
      handler.emit('*', emitData);
    }));
  };
  Object.setPrototypeOf(handler, EventEmitter.prototype);
  EventEmitter.call(handler);
  return handler;
};
