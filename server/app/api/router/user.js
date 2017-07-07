const User = require('../../model/model.js')('mlgithub_user', 'user');
const validators = require('../../lib/validators.js');
const middles = require('../../middles.js');

module.exports = (router) => {
  router.get('/users', middles.parseToken, middles.verifyToken, (req, res, next) => {
    User.find().lean().exec((err, d) => {
      if (err) return next(err);
      const rs = [];
      d.forEach((ele) => {
        rs.push({
          _id: ele._id,
          login: ele.login,
          email: ele.email,
          role: ele.role,
          active: ele.active,
          avatar_url: ele.avatar_url,
          loginDate: ele.loginDate,
        });
      });
      return res.json({
        status: 'OK',
        data: rs,
      });
    });
  });

  router.delete('/user/:id', middles.parseToken, middles.verifyToken, middles.needAdmin, (req, res, next) => {
    const _id = validators.toAlphanumeric(req.params.id);
    if (!_id) {
      next('E004001');
    } else {
      User.find({ _id }).remove((err) => {
        if (err) return next(err);
        return res.json({ status: 'OK' });
      });
    }
    return '';
  });

  router.post('/user', middles.parseToken, middles.verifyToken, middles.needAdmin, (req, res, next) => {
    // 驗證Email
    const email = validators.toEmail(req.body.email);
    if (email === '') return next('E002009');
    if (email.indexOf('@medialand.tw') < 0) return next('E002010');
    if (email.split('@medialand.tw')[1] !== '') return next('E002010');

    const login = validators.toNormalStr(req.body.login, { max: 50 });

    // 驗證身份
    let role = validators.toAlphanumeric(req.body.role);
    if (role !== 'admin') role = 'user';

    // 驗證帳號狀態
    let active = Number(req.body.active);
    if (isNaN(active)) return next('E004001');
    if (active !== 1) active = 0;

    const udata = { email, role, active };
    if (login !== '') udata.login = login;
    const newuser = new User(udata);
    return newuser.save((err) => {
      if (err) {
        if (err.code.toString() === '11000') {
          next('E002008');
        } else {
          next(err);
        }
      } else {
        res.json({ status: 'OK' });
      }
    });
  });

  router.put('/user/:id', middles.parseToken, middles.verifyToken, middles.needAdmin, (req, res, next) => {
    const _id = validators.toAlphanumeric(req.params.id);
    if (_id === '') return next('E004001');

    // 驗證Email
    const email = validators.toEmail(req.body.email);
    if (email === '') return next('E002009');
    if (email.indexOf('@medialand.tw') < 0) return next('E002010');
    if (email.split('@medialand.tw')[1] !== '') return next('E002010');

    const login = validators.toNormalStr(req.body.login, { max: 50 });

    // 驗證身份
    let role = validators.toAlphanumeric(req.body.role);
    if (role !== 'admin') role = 'user';

    // 驗證帳號狀態
    let active = Number(req.body.active);
    if (isNaN(active)) return next('E004001');
    if (active !== 1) active = 0;

    const udata = { email, role, active };
    const condition = [{ email }];
    if (login !== '') {
      udata.login = login;
      condition.push({ login });
    }
    return User.find()
      .and([
        { $or: condition },
        { _id: { $ne: _id } },
      ])
      .lean()
      .exec((err, d) => {
        if (err) return next(err);
        if (d.length > 0) return next('E002008');
        return User.update({ _id }, udata, (err2) => {
          if (err2) return next(err2);
          return res.json({ status: 'OK' });
        });
      });
  });
};
