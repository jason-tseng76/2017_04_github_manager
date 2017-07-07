const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const winston = require('winston');
require('winston-daily-rotate-file');

module.exports = (app) => {
  // 設定log的目錄
  const logDirectory = path.join(__dirname, 'log');

  // access log的設定(使用morgan)
  // 設定access log為每天寫入新的檔案
  if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);
  app.use(morgan('combined', {
    stream: rfs('access.log', { interval: '1d', path: logDirectory }),
  }));
  // 如果是dev的話，把access log顯示在console上
  if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));

  // console log的設定(使用Winston，取代原本的console.log)
  // 設定console log依日期寫入檔案
  const transport1 = new winston.transports.DailyRotateFile({
    filename: './server/log/-console.log',
    datePattern: 'dd-MM-yyyy',
    prepend: true,
    localTime: true,
  });
  // 設定custom log，並指定顏色(for console用)
  const logger = new (winston.Logger)({
    colors: {
      debug: 'blue',
      info: 'green',
      warn: 'yellow',
      error: 'red',
    },
    transports: [transport1],
  });
  // 設定把log輸出到console
  const transport2 = new (winston.transports.Console)({
    prettyPrint: true,
    colorize: true,
  });
  // 當exception發生時，輸出到console並寫入到log
  winston.handleExceptions([transport1, transport2]);
  if (process.env.NODE_ENV === 'dev') {
    // 如果是dev的話，允許一般的訊息顯示在console
    logger.add(winston.transports.Console, {
      prettyPrint: true,
      colorize: true,
    });
  }
  logger.log('info', 'logger ready');

  // 將winston輸出到global使用
  global.logger = logger;
};
