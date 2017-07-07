// 設定會依環境ENV而改變的 變數、sensitive data等等
const config = {

  PORT: process.env.PORT || 3014,

  // 如果允許CORS的話，允許的origin列在這裡(要有protocol)
  ALLOW_DOMAIN: ['http://localhost:8080'],

  // 要啟動的db connection資訊，如果只有一個的話，會用預設的mongoose當connection
  DB: {
    mlab: {
      pool: 5,
      uri: 'mongodb://..........',
    },
  },

  JWT_SECRET: '..........',
  GITHUB_SECRET: '..........',
  GITHUB_APP_ID: '..........',
  GITHUB_APP_SECRET: '..........',
};

// 把環境對應的config存到global.config裡
global.config = config;
module.exports = global;
