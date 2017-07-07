const middles = require('./middles.js');
const validators = require('./lib/validators.js');
const User = require('./model/model.js')('mlgithub_user', 'user');

// 處理HTTP 500
function http500(err, req, res, next) {
  return res.status(500).send('HTTP 500...');
}

// 處理HTTP 404
function http404(req, res) {
  global.logger.log('warn', 'http 404 - ', req.path);
  res.status(404).send('HTTP 404...');
}

module.exports = (app) => {
  app.use('/api', require('./api/index.js')(app));
  app.all('/login', (req, res) => {
    res.render('./server/public/login', { params: { githubclientid: global.config.GITHUB_APP_ID } });
  });
  app.all('/', (req, res) => {
    res.redirect('/repos');
  });
  app.get('/callback', (req, res) => {
    res.render('./server/public/callback');
  });

  app.all('/*', (req, res) => {
    let payload = null;
    if (req.cookies.t) {
      payload = validators.parseToken(req.cookies.t, global.config.JWT_SECRET);
    }
    if (!payload) {
      res.redirect('/login');
    } else {
      User.findOne({ email: payload.email, token: req.cookies.t }, '_id role active', (err, d) => {
        if (err) return res.redirect('/login');
        if (d) {
          // 帳號是否被停止
          if (d.active !== 1) return res.redirect('/login');
          return res.render('./server/public/main');
        }
        // 查無此人，或是token跟user對不起來
        return res.redirect('/login');
      });
    }
  });


  app.use(middles.errorHandler);
  if (process.env.NODE_ENV !== 'dev') app.use(http500);
  app.use(http404);
};
