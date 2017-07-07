const request = require('request');
const jwt = require('jsonwebtoken');
const User = require('../../model/model.js')('mlgithub_user', 'user');
const async = require('async');
// const validators = require('../../lib/validators.js');
const middles = require('../../middles.js');

module.exports = (router) => {
  router.post('/accesstoken', (req, res, next) => {
    const code = req.body.code;

    async.waterfall([
      // 用code取得access_token
      (cb) => {
        const url = 'https://github.com/login/oauth/access_token';
        request.post({
          url,
          form: {
            client_id: global.config.GITHUB_APP_ID,
            client_secret: global.config.GITHUB_APP_SECRET,
            code,
          },
        }, (err, response, body) => {
          if (err) {
            cb(err);
          } else if (body.indexOf('error=') === 0) {
            cb('E001001');
          } else {
            const token = body.split('access_token=')[1].split('&')[0];
            cb(null, token);
          }
        });
      },
      // 取得email
      (token, cb) => {
        request.get({
          url: 'https://api.github.com/user/emails',
          headers: {
            'user-agent': 'node.js',
            Authorization: `token ${token}`,
          },
        }, (err, response, body) => {
          if (err) {
            cb(err);
          } else {
            const bodydata = JSON.parse(body);
            let ismedialand = false;
            let memail = '';
            for (let i = 0; i < bodydata.length; i++) {
              const email = bodydata[i].email;
              if (email.indexOf('@medialand.tw') > 0) {
                memail = email;
                ismedialand = true;
              }
            }
            if (ismedialand) {
              cb(null, token, memail);
            } else {
              cb('E001001');
            }
          }
        });
      },
      // 取得使用者的login name
      (token, email, cb) => {
        request.get({
          url: 'https://api.github.com/user',
          headers: {
            'user-agent': 'node.js',
            Authorization: `token ${token}`,
          },
        }, (err, response, body) => {
          if (err) {
            cb(err);
          } else {
            const bodydata = JSON.parse(body);
            const payload = {
              login: bodydata.login,
              email,
            };
            const jwttoken = jwt.sign(payload, global.config.JWT_SECRET, { expiresIn: '1d' });
            const udata = {
              login: bodydata.login,
              email,
              avatar_url: bodydata.avatar_url,
              token: jwttoken,
              gittoken: token,
              loginDate: Date.now(),
            };
            if (email === 'jason@medialand.tw') udata.role = 'admin';
            if (email === 'ash@medialand.tw') udata.role = 'admin';
            if (email === 'william@medialand.tw') udata.role = 'admin';
            if (email === 'jack@medialand.tw') udata.role = 'admin';
            cb(null, udata);
          }
        });
      },
      // 配發token, 更新寫入資料庫
      (udata, cb) => {
        User.findOneAndUpdate({ email: udata.email }, udata, {
          upsert: true, setDefaultsOnInsert: true,
        }, (err) => {
          if (err) {
            cb(err);
          } else {
            cb(null, { status: 'OK', data: { token: udata.token } });
          }
        });
      },
    ], (err, rs) => {
      if (err) return next(err);
      return res.json(rs);
    });
  });

  router.get('/verifylogin', middles.parseToken, middles.verifyToken, (req, res) => {
    res.json({ status: 'OK', data: res.locals._user });
  });
  router.get('/logout', middles.parseToken, (req, res) => {
    if (!res.locals._err) {
      User.update({ email: res.locals._payload.email, token: res.locals._token }, { token: '' }).exec();
    }
    res.json({ status: 'OK' });
  });
};
