const cluster = require('cluster');
const domain = require('domain');
const model = require('./model/model.js');

module.exports = (server, app) => {
  function exitHandler(type) {
    global.logger.log('warn', type);
    try {
      setTimeout(() => { process.exit(1); }, 500);
      server.close();
      if (cluster.worker) cluster.worker.disconnect();
      model.disconnect();
    } catch (e) {
      global.logger.log('error', 'error when exit', e.stack);
    }
  }

  app.use((req, res, next) => {
    const reqDomain = domain.create();
    reqDomain.on('error', () => {
      exitHandler('middleware error');
    });
    reqDomain.run(next);
  });

  // so the program will not close instantly
  // process.stdin.resume(); // 這一行在Azure會出問題
  process.on('SIGINT', exitHandler.bind(null, 'SIGINT'));
  process.on('exit', exitHandler.bind(null, 'exit'));
  process.on('uncaughtException', (e) => {
    global.logger.log('error', e);
    exitHandler('uncaughtException');
  });
};
