const gulp = require('gulp');
const fs = require('fs-extra');
const uglify = require('gulp-uglify');
const request = require('request');
const async = require('async');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const stylus = require('gulp-stylus');
const babel = require('gulp-babel');

function parseStylus() {
  const autoprefixerOptions = {
    browsers: ['last 2 versions', '> 5%', 'last 3 Explorer versions'],
  };
  return gulp.src('./src/static/stylus/**/*.styl')
    .pipe(stylus())
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulp.dest('./src/static/css'));
}

function parseBabel() {
  return gulp.src('./src/static/es6/**/*.js')
    .pipe(babel({ presets: ['es2015'] }))
    .pipe(gulp.dest('./src/static/js'));
}

const jsfiles = [
  // jquery
  'https://code.jquery.com/jquery-3.1.1.min.js',
  // js cookies
  'https://cdnjs.cloudflare.com/ajax/libs/js-cookie/latest/js.cookie.min.js',
  // bootstrap
  // './node_modules/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js',
  // Vue
  // 'https://cdnjs.cloudflare.com/ajax/libs/vue/2.2.6/vue.min.js',
  // 'https://cdnjs.cloudflare.com/ajax/libs/vue-router/2.4.0/vue-router.min.js',
  // 'https://unpkg.com/vuex',
  // sweetalert2
  'https://cdn.jsdelivr.net/sweetalert2/6.3.1/sweetalert2.min.js',
  // memont.js
  'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.17.1/moment-with-locales.min.js',
  // Bootstrap daterangepicker
  'https://cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.js',
  // Clipboard
  'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/1.5.16/clipboard.min.js',
  // Google Charts
  'https://www.gstatic.com/charts/loader.js',
  // jquery-tagsinput
  'https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.js',
  // jquery-autocomplete
  'https://cdnjs.cloudflare.com/ajax/libs/jquery.devbridge-autocomplete/1.4.1/jquery.autocomplete.min.js',
  // template js
  './src/static/js/custom_es6.js',
];
const cssfiles = [
  // bootstrap
  // './node_modules/gentelella/vendors/bootstrap/dist/css/bootstrap.min.css',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
  // sweetalert2
  'https://cdn.jsdelivr.net/sweetalert2/6.3.1/sweetalert2.min.css',
  // Bootstrap daterangepicker
  'https://cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.css',
  // jquery-tagsinput
  // 'https://cdnjs.cloudflare.com/ajax/libs/jquery-tagsinput/1.3.6/jquery.tagsinput.min.css',

  './src/static/css/custom.css',
  './src/static/css/jason.css',
];
gulp.task('js', () => {
  parseBabel();
  let jsbody = '';
  async.eachSeries(jsfiles, (item, cb) => {
    if (item.indexOf('http') === 0) {
      request.get(item, (err, res, body) => {
        jsbody += `\n${body}`;
        cb();
      });
    } else {
      fs.readFile(item, 'utf8', (err, body) => {
        if (err) throw err;
        jsbody += `\n${body}`;
        cb();
      });
    }
  }, () => {
    fs.ensureFileSync('./src/static/tmp/vendor.js');
    fs.writeFileSync('./src/static/tmp/vendor.js', jsbody);
    return gulp.src('./src/static/tmp/*.js')
        .pipe(uglify({ preserveComments: 'license' }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(gulp.dest('../server/public/js'));
  });
});
gulp.task('css', () => {
  let cssbody = '';
  parseStylus();
  async.eachSeries(cssfiles, (item, cb) => {
    if (item.indexOf('http') === 0) {
      request.get(item, (err, res, body) => {
        cssbody += `\n${body}`;
        cb();
      });
    } else {
      fs.readFile(item, 'utf8', (err, body) => {
        if (err) throw err;
        cssbody += `\n${body}`;
        cb();
      });
    }
  }, () => {
    fs.ensureFileSync('./src/static/tmp/vendor.css');
    fs.writeFileSync('./src/static/tmp/vendor.css', cssbody);
    return gulp.src('./src/static/tmp/*.css')
      .pipe(cleanCSS({ compatibility: 'ie8' }))
      .pipe(gulp.dest('./dist/css'))
      .pipe(gulp.dest('../server/public/css'));
  });
});
gulp.task('default', ['js', 'css']);

gulp.task('p', () => {
  gulp.src('./dist/**/*.*')
    .pipe(gulp.dest('../server/public'));
});

gulp.task('stylus', parseStylus);
gulp.task('babel', parseBabel);

