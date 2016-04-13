import deployer from '../src/server';

const server = deployer([{}], {});

server.on('error', (err) => {
  console.error(err);
});

server.on('deploy', (event) => {
  console.log(event);
});
