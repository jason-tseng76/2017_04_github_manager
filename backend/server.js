// const path = require('path');
const express = require('express');
const webpack = require('webpack');

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
require(`../server/config/config_${process.env.NODE_ENV}.js`);
const config = require('./webpack.config.development.js');

const app = express();
const compiler = webpack(config);

const PORT = 8080;

app.use(require('webpack-dev-middleware')(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
  },
}));

app.use(require('webpack-hot-middleware')(compiler));

app.use(express.static('./dist'));
app.use(express.static('../server/public'));
app.set('view engine', 'pug');
app.set('views', '../server/public');

app.get('/login', (req, res) => {
  res.render('./login', { params: { githubclientid: global.config.GITHUB_APP_ID } });
});
app.get('/callback', (req, res) => {
  res.render('./callback');
});
app.all('/', (req, res) => {
  res.redirect('/repos');
});
app.get('/*', (req, res) => {
  res.render('./main');
});

app.listen(PORT, 'localhost', (err) => {
  if (err) {
    // console.log(err);
  }
  // console.log(`Listening at http://localhost:${PORT}`);
});
