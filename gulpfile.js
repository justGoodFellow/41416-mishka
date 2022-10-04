'use strict';

var advancedVariables = require('postcss-advanced-variables');
var autoprefixer = require('autoprefixer');
var del = require('del');
var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var inlineSvg = require('postcss-inline-svg');
var minify = require('gulp-csso');
var mixins = require('postcss-mixins');
var nested = require('postcss-nested');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var presetEnv = require('postcss-preset-env');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var svgmin = require('gulp-svgmin');
var svgo = require('postcss-svgo');
var svgstore = require('gulp-svgstore');
var sync = require('browser-sync').create();
var webp = require('gulp-webp');

function clean() {
  return del('build');
}

function copy() {
  return gulp.src([
    'fonts/**/*.{woff,woff2}',
    'img/**',
    'js/**',
    '*.html'
  ], {
    base: '.'
  })
  .pipe(gulp.dest('build'));
}

function html() {
  return gulp.src('*.html')
    .pipe(plumber())
    .pipe(gulp.dest('build'))
    .pipe(sync.stream());
}

function styles() {
  return gulp.src('postcss/style.css')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(postcss([
      advancedVariables(),
      mixins(),
      nested(),
      presetEnv(),
      inlineSvg(),
      svgo(),
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('build/css'))
    .pipe(sync.stream());
}

function scripts() {
  return gulp.src('js/**/*.js')
    .pipe(plumber())
    .pipe(gulp.dest('build/js'))
    .pipe(sync.stream());
}

function images() {
  return gulp.src('build/img/**/*.{png,jpg,gif,svg}')
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({
        progressive: true,
        quality: 100
      }),
      imagemin.svgo({
        plugins: [{
          removeViewBox: false
        }]
      })
    ]))
    .pipe(gulp.dest('build/img'));
}

function createWebp() {
  return gulp.src('build/img/**/*.{png,jpg}')
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest('build/img'));
}

function symbols() {
  return gulp.src('build/img/*.svg')
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('symbols.svg'))
    .pipe(gulp.dest('build/img'));
}

function server() {
  sync.init({
    server: 'build',
    cors: true,
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch('*.html', html);
  gulp.watch('postcss/**/*.css', styles);
  gulp.watch('js/**/*.js', scripts);
}

var build = gulp.series(
    clean,
    copy,
    styles,
    images,
    createWebp,
    symbols
);

exports.clean = clean;
exports.copy = copy;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.webp = createWebp;
exports.symbols = symbols;
exports.server = server;

exports.default = build;
