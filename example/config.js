import { md5 } from './helper';

exports.logPath = '/home/wulian/lab/logs/';
exports.cachePath = `${__dirname.replace('/example', '')}/.cache/`;

const projects = [{
  repo: 'git@willin.net:lab/auto-deploy.git',
  path: '/home/wulian/lab/auto-deploy/',
  app: 'test'
}];

exports.projects = (() => {
  const result = {};
  for (let i = 0; i < projects.length; i++) {
    result[md5(projects[i].repo)] = projects[i];
  }
  return result;
})();
