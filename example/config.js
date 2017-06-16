const { md5 } = require('@dwing/common');

exports.logPath = '/home/ubuntu/apps/logs/';

const projects = [{
  repo: 'git@git.coding.net:willin/test.git',
  path: '/',
  ref: 'refs/heads/master',
  app: 'test'
}];

exports.projects = (() => {
  const result = {};
  for (let i = 0; i < projects.length; i += 1) {
    result[md5(projects[i].repo)] = projects[i];
  }
  return result;
})();
