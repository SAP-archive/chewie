'use strict';

const gulp = require('gulp'),
  concat = require('gulp-concat'),
  log = require('./logger')
  tap = require('gulp-tap');


function minify(minOperation, opts, cb) {

  const src = opts.src,
    dest = opts.dest,
    name = opts.name,
    concatName = name ? concat(name) : tap(() => {}),
    options = opts.opts ? opts.opts : {};

  if(!src || !dest) return cb(`Unable to perform minification operation because of wrong src: ${src} or dest: ${dest} value`);

  gulp.src(src)
    .pipe(minOperation(options))
    .on('error', (err) => {
      log.error('Minification failed');
      cb(err);
    })
    .pipe(concatName)
    .pipe(gulp.dest(dest))
    .on('end', cb);

}

function minifyAsync(minOperation, opts){

  return (cb) => {

    minify(minOperation, opts, cb);

  };

}

const minifier = {
  minify,
  minifyAsync
};


module.exports = minifier;
