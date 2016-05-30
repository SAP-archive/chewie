'use strict';

const minifyCSS = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  minifyHTML = require('gulp-minify-html'),
  imagemin = require('gulp-imagemin'),
  jsonminify = require('gulp-jsonminify'),
  async = require('async'),
  minifier = require('../helpers/minifier');

const minify = (config, next) => {

  const minification = config.minification;

  const js = minification.js,
    css = minification.css,
    html = minification.html,
    img = minification.img,
    json = minification.json,
    min = [];

  js && _prepareMinTaskArray(uglify, js, min);
  css && _prepareMinTaskArray(minifyCSS, css, min);
  html && _prepareMinTaskArray(minifyHTML, html, min);
  img && _prepareMinTaskArray(imagemin, img, min);
  json && _prepareMinTaskArray(jsonminify, json, min);

  async.series(min, next);

};

function _prepareMinTaskArray(injector, arrOfConfig, min) {

  let asyncTask;

  arrOfConfig.forEach((config) => {
    asyncTask = minifier.minifyAsync(injector, config);
    min.push(asyncTask);
  });
}

module.exports = minify;
