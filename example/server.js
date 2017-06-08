const deployer = require('../src/server');
const { md5 } = require('@dwing/common');
const fs = require('fs');
const { exist, spawn, setVersion } = require('./helper');
const { logPath, cachePath, projects } = require('./config');

const server = deployer();

server.on('error', (err) => {
  console.error(err);
});

server.on('push', async (event) => {
  const payload = event.payload;
  const key = md5(payload.repository.ssh_url);
  const project = projects[key];
  // 确定为哪个项目触发的部署
  if (project === undefined) {
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
  console.log('%s Deploy start at %s', project.app, new Date());
  // 拉取最新代码
  console.log(
    await spawn('git', ['pull'], { cwd: project.path, env: process.env })
  );
  // 判断项目版本是否升级
  let pack;
  try {
    pack = JSON.parse(fs.readFileSync(packPath, 'utf8'));
  } catch (e) { pack = {}; }
  const versionCache = `${cachePath}${key}.version`;
  if (await exist(versionCache)) {
    const currentVersion = fs.readFileSync(versionCache, 'utf8');
    console.log(currentVersion === pack.version, currentVersion, pack.version);
    if (currentVersion === pack.version) {
      return;
    }
  }
  // 更新依赖项
  console.log(
    await spawn('yarn', ['install'], { cwd: project.path, env: process.env })
  );
  // 删除日志
  await spawn('rm', [`${project.app}*.log`], { cwd: logPath, env: process.env });
  // 平滑热重启
  console.log(
    await spawn('pm2', ['reload', project.app], { cwd: project.path, env: process.env })
  );
  // 记录当前版本号
  await setVersion(versionCache, pack.version);
});
