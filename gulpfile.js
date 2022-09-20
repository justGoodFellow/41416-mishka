'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var minify = require('gulp-csso');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var server = require('browser-sync');
var del = require('del');
var inlinesvg = require('postcss-inline-svg');
var inlinesvgopt = require('postcss-svgo');
var postcssMixins = require('postcss-mixins');
var postcssAdvancedVariables = require('postcss-advanced-variables');
var postcssNested = require('postcss-nested');
var postcssPresetEnv = require('postcss-preset-env');

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
    .pipe(gulp.dest('build'))
    .pipe(server.reload({stream: true}));
}

function style() {
  return gulp.src('postcss/style.css')
    .pipe(plumber())
    .pipe(postcss([
      postcssMixins(),
      postcssAdvancedVariables(),
      postcssNested(),
      postcssPresetEnv(),
      inlinesvg(),
      inlinesvgopt(),
      autoprefixer()
    ]))
    .pipe(gulp.dest('build/css'))
    .pipe(minify())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css'))
    .pipe(server.reload({stream: true}));
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
        plugins: [
          {
            removeViewBox: false
          }
        ]
      })
    ]))
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

function serve() {
  server.init({
    server: 'build',
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch('postcss/**/*.css', style);
  gulp.watch('*.html', html);
}

var build = gulp.series(
    clean,
    copy,
    style,
    images,
    symbols
);

exports.clean = clean;
exports.copy = copy;
exports.html = html;
exports.style = style;
exports.images = images;
exports.symbols = symbols;
exports.serve = serve;

exports.default = build;
