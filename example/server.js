const deployer = require('../src/server');
const { md5, getTimestamp } = require('@dwing/common');
const redis = require('./redis');
const { exist, spawn } = require('./helper');
const { logPath, projects } = require('./config');

const server = deployer();

server.on('error', (err) => {
  console.error(err);
});

server.on('push', async (event) => {
  console.log(JSON.stringify(event, null, 2));
  const payload = event.payload;
  const key = md5(payload.repository.ssh_url);
  const project = projects[key];
  // 确定为哪个项目触发的部署
  if (project === undefined) {
    return;
  }
  if (project.token && payload.token !== project.token) {
    return;
  }
  // 只构建设定分支
  if (event.event !== 'push' || payload.ref !== project.ref) {
    return;
  }
  const packPath = `${project.path}package.json`;
  // 判断项目目录是否存在
  if (!exist(packPath)) {
    return;
  }
  const commit = payload.after.substr(0, 7);
  console.log('%s Deploy #%s started at %s', project.app, commit, new Date());
  await redis.set(`deploy:${project.app}:${getTimestamp()}`, commit);
  // 拉取最新代码
  await spawn('git', ['checkout', '.'], { cwd: project.path, env: process.env });
  await spawn('git', ['fetch'], { cwd: project.path, env: process.env });
  await spawn('git', ['checkout', commit], { cwd: project.path, env: process.env });
  // 更新依赖项
  await spawn('yarn', { cwd: project.path, env: process.env });
  // 删除日志
  await spawn('rm', [`${project.app}*.log`], { cwd: logPath, env: process.env });
  // 平滑热重启
  await spawn('pm2', ['reload', project.app], { cwd: project.path, env: process.env });
  console.log('%s Deploy #%s ended at %s', project.app, commit, new Date());
});
