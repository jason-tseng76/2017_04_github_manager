const errCodes = require('./errorCodes.js');
const jwt = require('jsonwebtoken');
const User = require('./model/model.js')('mlgithub_user', 'user');

const middles = {};

// 開放來自任何網域的api call
middles.allowAll = (req, res, next) => {
  if (process.env.NODE_ENV === 'dev') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Authorization');
    res.header('Access-Control-Allow-Origin', '*');
  }
  next();
};

// // 確定api call來源是在whitelist裡
// middles.allowAccess = (req, res, next) => {
//   const host = req.get('host');
//   const referer = req.get('referer');
//   let rurl = ''; // 來源網址
//   if (referer) rurl = referer.replace('http://', '').replace('https://', '').split('/')[0];
//   // 先允許Methods及Headers的種類
//   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Authorization');

//   if (rurl !== '') {
//     if (rurl === host) {
//       // 從自己的網站發出的，無需驗證
//       next();
//     } else {
//       const allowOrigin = `${req.protocol}://${rurl}`;
//       if (!req._token) {
//         // 如果req._token不存在的話，就對網址進行驗證，是否已經在whitelist裡
//         if (global.ALLOW_DOMAIN.indexOf(allowOrigin) >= 0) {
//           res.header('Access-Control-Allow-Origin', allowOrigin);
//           next();
//         } else {
//           next(errCodes.get('E001001'));
//         }
//       } else {
//         // 如果req._token有值的話，表示是第二次請求，直接allow
//         res.header('Access-Control-Allow-Origin', allowOrigin);
//         next();
//       }
//     }
//   } else {
//     // 從本機端或是另一台server發出
//     res.header('Access-Control-Allow-Origin', '*');
//     next();
//   }
// };

// 解析token
middles.parseToken = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    const t = req.headers.authorization.split(' ')[1];
    jwt.verify(t, global.config.JWT_SECRET, (err, d) => {
      if (err) {
        if (err.name === 'JsonWebTokenError') res.locals._err = 'E003001';
        if (err.name === 'TokenExpiredError') res.locals._err = 'E003002';
      } else {
        res.locals._payload = d;
        res.locals._token = t;
      }
      next();
    });
  } else {
    res.locals._err = 'E003001';
    next();
  }
};

middles.needAdmin = (req, res, next) => {
  if (res.locals._user.role !== 'admin') {
    next('E002007');
  } else {
    next();
  }
};

// 從DB驗證token是否真的合法
middles.verifyToken = (req, res, next) => {
  // 先確定token是否有parse成功
  if (res.locals._err) {
    next(res.locals._err);
  } else {
    User.findOne({ email: res.locals._payload.email, token: res.locals._token }, '_id email login role active avatar_url gittoken', (err, d) => {
      if (err) return next(err);
      if (d) {
        // 帳號被停止
        if (d.active !== 1) return next('E002006');
        res.locals._user = {
          _id: d._id,
          email: d.email,
          login: d.login,
          role: d.role,
          active: d.active,
          avatar_url: d.avatar_url,
          exp: res.locals._payload.exp,
          gittoken: d.gittoken,
        };
        return next();
      }
      // 查無此人，或是token跟user對不起來
      return next('E003001');
    });
  }
};

// 處理error
middles.errorHandler = (err, req, res, next) => {
  global.logger.log('error', 'errorHandler');
  global.logger.log('error', err);
  if (err) {
    if (typeof err === 'string') {
      if (err.substr(0, 1) === 'E') {
        res.json({ status: 'ERROR', err: errCodes.get(err) });
      } else {
        res.json({ status: 'ERROR', err: { message: err } });
      }
    } else {
      res.json({ status: 'ERROR', err });
    }
  } else {
    next();
  }
};

module.exports = middles;
