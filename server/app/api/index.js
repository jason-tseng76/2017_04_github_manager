const express = require('express');
// const useragent = require('express-useragent');
const middles = require('../middles.js');

module.exports = () => {
  const router = express.Router();
  router.use(middles.allowAll);
  require('./router/repo.js')(router);
  require('./router/auth.js')(router);
  require('./router/user.js')(router);
  require('./router/webhook.js')(router);
  return router;
};
