const HookEvent = require('../../model/model.js')('mlgithub_hookevent', 'hookevent');
const validators = require('../../lib/validators.js');
const request = require('request');
// const middles = require('../../middles.js');

module.exports = (router) => {
  // https://developer.github.com/v3/activity/events/types/#pushevent
  router.post('/github/webhook', (req, res, next) => {
    // console.log('event from github..');
    const payload = JSON.parse(req.body.payload);
    // console.log(payload);
    // console.log(payload.ref);
    global.logger.info('event from github...');
    global.logger.info(payload.after);
    // const brench = payload.ref.replace('refs/heads/', '');

    const hook = new HookEvent({
      repo: payload.repository.name,
      ref: payload.ref,
      head: payload.after,
      commitmessage: payload.head_commit.message,
    });
    hook.save((err) => {
      if (err) {
        next(err);
      } else {
        res.send('');
      }
    });
  });
  router.get('/github/hookevent', (req, res, next) => {
    const repo = validators.toNormalStr(req.query.q);
    HookEvent.findOne({ repo })
      .select('repo ref head commitmessage createdAt')
      .sort({ createdAt: -1 }).exec((err, d) => {
        if (err) return next(err);
        return res.json({ status: 'OK', data: d });
      });
  });
  router.get('/webhook/:repo', (req, res, next) => {
    const repo = req.params.repo;
    const baseUri = 'https://api.github.com';
    const url = `${baseUri}/repos/MedialandDev/${repo}/hooks`;
    request.get({
      url,
      headers: {
        'user-agent': 'node.js',
        Authorization: `token ${global.config.GITHUB_SECRET}`,
      },
    }, (err, response, body) => {
      if (err) return next(err);
      const bodydata = JSON.parse(body);
      // const resdata = {
      //   id: bodydata.id,
      //   name: bodydata.name,
      //   url: bodydata.url,
      //   config: bodydata.config,
      //   created_at: bodydata.created_at,
      //   updated_at: bodydata.updated_at,
      // };
      return res.json({ status: 'OK', data: bodydata });
    });
  });
  router.post('/webhook/:repo', (req, res, next) => {
    const repo = req.params.repo;
    const baseUri = 'https://api.github.com';
    const url = `${baseUri}/repos/MedialandDev/${repo}/hooks`;
    const turl = req.body.url;
    const formdata = {
      name: 'web',
      events: ['push'],
      active: true,
      config: {
        url: turl,
        content_type: 'form',
        // secret: global.config.GITHUB_SECRET,
      },
    };
    request.post({
      url,
      body: JSON.stringify(formdata),
      headers: {
        'user-agent': 'node.js',
        Authorization: `token ${global.config.GITHUB_SECRET}`,
      },
    }, (err, response, body) => {
      if (err) return next(err);
      const bodydata = JSON.parse(body);
      if (bodydata.errors) {
        return res.json({
          status: 'ERROR',
          err: {
            code: bodydata.errors[0].code,
            message: bodydata.errors[0].message,
          },
        });
      }
      return res.json({ status: 'OK', data: bodydata });
    });
  });
  router.delete('/webhook/:repo/:id', (req, res, next) => {
    const repo = req.params.repo;
    const id = req.params.id;
    const baseUri = 'https://api.github.com';
    const url = `${baseUri}/repos/MedialandDev/${repo}/hooks/${id}`;
    request.delete({
      url,
      headers: {
        'user-agent': 'node.js',
        Authorization: `token ${global.config.GITHUB_SECRET}`,
      },
    }, (err) => {
      if (err) return next(err);
      return res.json({ status: 'OK' });
    });
  });
};
