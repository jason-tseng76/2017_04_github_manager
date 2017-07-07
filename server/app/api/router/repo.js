const request = require('request');
const middles = require('../../middles.js');
const async = require('async');
const validators = require('../../lib/validators.js');

const fn = {};

module.exports = (router) => {
  router.get('/repos', middles.parseToken, middles.verifyToken, (req, res, next) => {
    let pagesize = Number(req.query.pagesize);
    if (isNaN(pagesize)) pagesize = 10;
    let page = Number(req.query.page);
    if (isNaN(page)) page = 1;
    const q = req.query.q;

    const baseUri = 'https://api.github.com';
    let token = global.config.GITHUB_SECRET;
    let url = `${baseUri}/user/repos?sort=updated&page=${page}&per_page=${pagesize}`;
    // if (q) {
    //   url = `${baseUri}/search/repositories?sort=updated&page=${page}&per_page=${pagesize}`;
    //   url += `&q=${q}+in:name+user:DevMedialand`;
    // }
    if (res.locals._user.role !== 'admin') {
      url += '&affiliation=collaborator';
      // if (q) {
      //   url = `${baseUri}/search/repositories?sort=updated&page=${page}&per_page=${pagesize}`;
      //   url += `&q=${q}+in:name+user:${res.locals._user.login}`;
      // }
      token = res.locals._user.gittoken;
    }
    // if (q) url = `${baseUri}/search/repositories?sort=updated&page=${page}&per_page=${pagesize}&q=${q}`;
    request.get({
      url,
      headers: {
        'user-agent': 'node.js',
        Authorization: `token ${token}`,
      },
    }, (err, response, body) => {
      if (err) return next(err);
      let totalpage = 1;
      if (response.headers.link) {
        const f1 = response.headers.link.split('&page=');
        let lastgot = false;
        f1.forEach((ele) => {
          if (ele.indexOf('rel="prev"') > 0) {
            if (!lastgot) totalpage = Number(ele.split('>')[0].split('&')[0]) + 1;
          }
          if (ele.indexOf('rel="last"') > 0) {
            lastgot = true;
            totalpage = Number(ele.split('>')[0].split('&')[0]);
          }
        });
      }

      const parsedata = JSON.parse(body);
      let bodydata;
      if (parsedata.items) {
        bodydata = parsedata.items;
      } else {
        bodydata = parsedata;
      }
      const resdata = [];
      bodydata.forEach((ele) => {
        const obj = {
          _id: ele.id,
          name: ele.name,
          full_name: ele.full_name,
          url: ele.url,
          html_url: ele.html_url,
          git_url: ele.git_url,
          created_at: ele.created_at,
          updated_at: ele.updated_at,
        };
        resdata.push(obj);
      });
      return res.json({ status: 'OK', data: resdata, page, pagesize, totalpage });
    });
  });

  router.post('/repos', middles.parseToken, middles.verifyToken, (req, res, next) => {
    const name = req.body.name;
    const collaborators = validators.toStr(req.body.cols).split(',');
    const description = req.body.description || '';
    const init = validators.toStr(req.body.init);
    const auto_init = (init === 'yes');

    const baseUri = 'https://api.github.com';
    async.waterfall([
      (cb) => {
        const url = `${baseUri}/user/repos`;
        const formdata = { name, private: true, description, auto_init };
        request.post({
          url,
          body: JSON.stringify(formdata),
          headers: {
            'user-agent': 'node.js',
            Authorization: `token ${global.config.GITHUB_SECRET}`,
          },
        }, (err, response, body) => {
          if (err) return cb(err);
          const bodydata = JSON.parse(body);
          if (bodydata.id) return cb();
          return cb('create repo fail');
        });
      },
      (cb) => {
        collaborators.forEach((ele) => {
          if (ele !== '') fn.addCollaborator(name, ele);
        });
        cb();
      },
    ], (err) => {
      if (err) return next(err);
      return res.json({ status: 'OK' });
    });
  });

  router.get('/repos/:repo', middles.parseToken, middles.verifyToken, (req, res, next) => {
    const repo = req.params.repo;
    const baseUri = 'https://api.github.com';
    const url = `${baseUri}/repos/MedialandDev/${repo}`;
    request.get({
      url,
      headers: {
        'user-agent': 'node.js',
        Authorization: `token ${global.config.GITHUB_SECRET}`,
      },
    }, (err, response, body) => {
      if (err) return next(err);
      const bodydata = JSON.parse(body);
      const resdata = {
        name: bodydata.name,
        full_name: bodydata.full_name,
        url: bodydata.url,
        html_url: bodydata.html_url,
        git_url: bodydata.git_url,
        created_at: bodydata.created_at,
        updated_at: bodydata.updated_at,
      };
      return res.json({ status: 'OK', data: resdata });
    });
  });

  router.put('/repos/:repo', middles.parseToken, middles.verifyToken, (req, res, next) => {
    const repo = req.params.repo;
    const name = req.body.name;
    const collaborators = validators.toStr(req.body.cols).split(',');
    const description = req.body.description || '';

    const baseUri = 'https://api.github.com';
    async.waterfall([
      (cb) => {
        if (res.locals._user.role !== 'admin') {
          fn.collaborators(repo, (err, response, body) => {
            if (err) return cb(err);
            const bodydata = JSON.parse(body);
            let can = false;
            bodydata.forEach((ele) => {
              if (ele.login === res.locals._user.login) can = true;
            });
            if (can) return cb();
            return cb('E001001');
          });
        } else {
          cb();
        }
      },
      (cb) => {
        const formdata = { name, description };
        const url = `${baseUri}/repos/MedialandDev/${repo}`;
        request({
          url,
          method: 'PATCH',
          body: JSON.stringify(formdata),
          headers: {
            'user-agent': 'node.js',
            Authorization: `token ${global.config.GITHUB_SECRET}`,
          },
        }, (err) => {
          if (err) return cb(err);
          return cb();
        });
      },
      (cb) => {
        fn.collaborators(name, (err, response, body) => {
          if (err) return cb(err);
          const bodydata = JSON.parse(body);
          const resdata = [];
          bodydata.forEach((ele) => {
            resdata.push(ele.login);
          });
          collaborators.forEach((ele) => {
            if (ele !== '') {
              let exist = false;
              for (let i = 0; i < resdata.length; i++) {
                if (ele === resdata[i]) {
                  exist = true;
                  break;
                }
              }
              if (!exist) fn.addCollaborator(name, ele);
            }
          });
          if (res.locals._user.role === 'admin') {
            resdata.forEach((ele) => {
              let exist = false;
              for (let i = 0; i < collaborators.length; i++) {
                if (ele === collaborators[i]) {
                  exist = true;
                  break;
                }
              }
              if (!exist) fn.removeCollaborator(name, ele);
            });
          }
          return cb();
        });
      },
    ], (err) => {
      if (err) return next(err);
      return res.json({ status: 'OK' });
    });
  });

  // router.delete('/repos/:repo', middles.parseToken, middles.verifyToken, (req, res, next) => {
  //   const repo = req.params.repo;

  //   const baseUri = 'https://api.github.com';
  //   const url = `${baseUri}/repos/MedialandDev/${repo}`;
  //   request({
  //     url,
  //     method: 'DELETE',
  //     headers: {
  //       'user-agent': 'node.js',
  //       Authorization: `token ${global.config.GITHUB_SECRET}`,
  //     },
  //   }, (err) => {
  //     if (err) return next(err);
  //     return res.json({ status: 'OK' });
  //   });
  // });

  router.get('/repos/:repo/collaborators', middles.parseToken, middles.verifyToken, (req, res, next) => {
    const repo = req.params.repo;

    fn.collaborators(repo, (err, response, body) => {
      if (err) return next(err);
      const bodydata = JSON.parse(body);
      const resdata = [];
      bodydata.forEach((ele) => {
        resdata.push({
          login: ele.login,
          id: ele.id,
          avatar_url: ele.avatar_url,
          permissions: ele.permissions,
        });
      });
      return res.json({ status: 'OK', data: resdata });
    });
  });

  router.post('/repos/:repo/collaborators/:login', middles.parseToken, middles.verifyToken, (req, res, next) => {
    const repo = req.params.repo;
    const login = req.params.login;

    fn.addCollaborator(repo, login, (err) => {
      if (err) return next(err);
      return res.json({ status: 'OK' });
    });
  });

  router.delete('/repos/:repo/collaborators/:login', middles.parseToken, middles.verifyToken, (req, res, next) => {
    const repo = req.params.repo;
    const login = req.params.login;

    fn.removeCollaborator(repo, login, (err) => {
      if (err) return next(err);
      return res.json({ status: 'OK' });
    });
  });
};

fn.collaborators = (repo, cb) => {
  const baseUri = 'https://api.github.com';
  const url = `${baseUri}/repos/MedialandDev/${repo}/collaborators`;
  request({
    url,
    method: 'GET',
    headers: {
      'user-agent': 'node.js',
      Authorization: `token ${global.config.GITHUB_SECRET}`,
    },
  }, (err, response, body) => {
    cb(err, response, body);
  });
};

fn.addCollaborator = (repo, login, cb) => {
  const baseUri = 'https://api.github.com';
  const url = `${baseUri}/repos/MedialandDev/${repo}/collaborators/${login}`;
  request({
    url,
    body: JSON.stringify({ permission: 'push' }),
    method: 'PUT',
    headers: {
      'user-agent': 'node.js',
      Authorization: `token ${global.config.GITHUB_SECRET}`,
    },
  }, (err, response, body) => {
    if (cb) cb(err, response, body);
  });
};

fn.removeCollaborator = (repo, login, cb) => {
  const baseUri = 'https://api.github.com';
  const url = `${baseUri}/repos/MedialandDev/${repo}/collaborators/${login}`;
  request({
    url,
    method: 'DELETE',
    headers: {
      'user-agent': 'node.js',
      Authorization: `token ${global.config.GITHUB_SECRET}`,
    },
  }, (err, response, body) => {
    if (cb) cb(err, response, body);
  });
};
