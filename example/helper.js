const { getDefer } = require('@dwing/common');
const cp = require('child_process');
const fs = require('fs');

const exist = (path) => {
  const deferred = getDefer();
  fs.stat(path, (err, stat) => {
    if (err) {
      deferred.resolve(false);
    }
    deferred.resolve(stat);
  });
  return deferred.promise;
};

const spawn = (cmd, args, options) => {
  const deferred = getDefer();
  const thread = cp.spawn(cmd, args, options);
  let resp = '';

  thread.on('error', (err) => {
    console.error(err);
  });

  thread.stdout.on('data', (buffer) => {
    resp += buffer.toString();
  });

  thread.stdout.on('end', () => {
    deferred.resolve(resp);
  });

  return deferred.promise;
};

exports.exist = exist;
exports.spawn = spawn;
