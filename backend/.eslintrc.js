// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  extends: 'airbnb-base',

  // 才能 lint .vue 檔
  plugins: [
    'html',
  ],

  // eslint-plugin-import 會用 webpack 的 resolve modules 設定
  settings: {
    'import/resolver': {
      webpack: {
        config: 'webpack.config.js',
      },
    },
  },

  // 自訂規則
  rules: {
    // import 的時候不用寫 .js 跟 .vue
    'import/extensions': ['error', 'always', {
      js: 'never',
      vue: 'never',
    }],
    // 'no-console': ['off'],
    'global-require': ['off'],
    'import/no-dynamic-require': ['off'],
    'no-underscore-dangle': ['off'],
    'no-param-reassign': ['error', { props: false }],
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
  },

  'globals': {
    '$': false,
    'jQuery': false,
    'Vue': false,
    'Vuex': false,
    'VueRouter': false,
    'io':false,
    'swal': false,
    'gapi': false,
    'moment': false,
    'Cookies': false,
    'Sortable': false,
    'Clipboard': false,
    'google': false,
  }
};