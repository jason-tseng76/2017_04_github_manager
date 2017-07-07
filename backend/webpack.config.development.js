const webpack = require('webpack');
const baseConfig = require('./webpack.config.js');

const config = Object.create(baseConfig);

config.output.publicPath = 'http://localhost:8080/js/';

config.plugins.push(new webpack.HotModuleReplacementPlugin());
config.plugins.push(new webpack.NoEmitOnErrorsPlugin());
config.plugins.push(new webpack.DefinePlugin({ __DEV__: true, 'process.env': { NODE_ENV: JSON.stringify(process.env.NODE_ENV) } }));

module.exports = config;
