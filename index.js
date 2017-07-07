const express = require('express');
// const fs = require('fs');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const model = require('./server/model/model.js');
const moment = require('moment');

// 設定環境變數
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// 引用設定檔
require(`./server/config/config_${process.env.NODE_ENV}.js`);

const port = global.config.PORT;
const app = express();

// 設定moment時區
moment.locale('zh-TW');

// 設定log
require('./server/log.js')(app);

// 對於express進行基本的安全性保護
app.use(helmet());
// Cookie的middleware，設定signed cookies的key值(有用到signed cookies才會用到)
app.use(cookieParser(global.config.jwtsecret));
// 設定bodyParser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// 設定view engine
app.set('view engine', 'pug');
// 將預設的views目錄設定到root，以方便靈活使用
app.set('views', './');
// 設定public dir
app.use(express.static('./server/public'));

// Connect DB
model.createConnect();

// 對app及「其下一層目錄」進行掃瞄，自動引入index.js檔，免去自己require的麻煩
// function scanApps() {
//   const filesdata = fs.readdirSync('./server/app');
//   for (let i = 0; i < filesdata.length; i++) {
//     if (filesdata[i].indexOf('.js') < 0) {
//       try {
//         global.logger.info(`requiring './server/app/${filesdata[i]}'`);
//         require(`./server/app/${filesdata[i]}`)(app);
//       } catch (e) {
//         global.logger.error(e);
//       }
//     }
//   }
//   require('./server/app')(app);
// }
// scanApps();
require('./server/app')(app);

// 使用socket.io
// require("./socket.js")(server);

// 啟動server
const server = app.listen(port, '127.0.0.1', () => {
  global.logger.info(`Listening on port ${port}`);
});

// 程式發生exception時的例外處理
require('./server/exceptionHandler.js')(server, app);

