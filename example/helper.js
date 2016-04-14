import crypto from 'crypto';
import cp from 'child_process';
import fs from 'fs';

const md5 = (str) => {
  const instance = crypto.createHash('md5');
  instance.update(`${str}`);
  return instance.digest('hex');
};

const getDefer = () => {
  const deferred = {};
  deferred.promise = new Promise((resolve, reject) => {
    deferred.resolve = resolve;
    deferred.reject = reject;
  });
  return deferred;
};

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

  thread.stderr.on('data', () => {
    return;
  });

  thread.stdout.on('data', (buffer) => {
    resp += buffer.toString();
  });

  thread.stdout.on('end', () => {
    deferred.resolve(resp);
  });

  return deferred.promise;
};

const setVersion = (file, ver) => {
  const deferred = getDefer();
  fs.writeFile(file, ver, (err) => {
    if (err) {
      deferred.resolve(false);
    }
    deferred.resolve(true);
  });
  return deferred.promise;
};

exports.md5 = md5;
exports.getDefer = getDefer;
exports.exist = exist;
exports.spawn = spawn;
exports.setVersion = setVersion;
