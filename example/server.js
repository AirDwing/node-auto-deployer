import deployer from '../src/server';
import fs from 'fs';
import { exist, md5, spawn, setVersion } from './helper';
import { logPath, cachePath, projects } from './config';

const server = deployer();

server.on('error', (err) => {
  console.error(err);
});

server.on('build', async(event) => {
  const payload = event.payload;
  const key = md5(payload.repository.git_ssh_url);
  console.log(payload.repository.git_ssh_url, key);
  // 构建失败
  if (event.event !== 'build' || payload.build_status !== 'success' || payload.build_stage !== 'deploy') {
    return;
  }
  // 确定为哪个项目触发的部署
  const project = projects[key];
  if (project === undefined) {
    return;
  }
  const packPath = `${project.path}package.json`;
  // 判断项目目录是否存在
  if (!exist(packPath)) {
    return;
  }
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
    await spawn('npm', ['install'], { cwd: project.path, env: process.env })
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
