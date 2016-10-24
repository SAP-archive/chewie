'use strict';
const gulp = require('gulp'),
  replace = require('gulp-replace'),
  validator = require('../helpers/validator'),
  makeBuffer = require('gulp-buffer'),
  log = require('./logger');

/**
 * This function replaces given value in the file
 * @param {Array} [src] - array of source locations
 * @param {Array} [oldContent] - content that is in the file
 * @param {Array} [newContent] - content that must be written to the file
 * @param {String} [dest] - desting directory
 * @param {Function} [next] - callback for asynch operations
 */
function replaceInFile(src, oldContent, newContent, dest, next) {
  gulp.src([src, '!./**/*.{png,jpg,jpeg,bmp,gif}'])
    .pipe(makeBuffer())
    .pipe(replace(oldContent, newContent))
    .on('error', (err) => {
      log.error(`Replacement for the following file has failed: ${src}`);
      next(err);
    })
    .pipe(gulp.dest(dest))
    .on('end', next);
}

/**
 * This function is a helper for parallel operations. Reuses copyFiles function
 * @param {String} [src] - file to perform operations on
 * @param {String} [oldContent] - content to be found in the src
 * @param {String} [newContent] - new content to be replaced in src
 * @param {String} [dest] - destination of a file after replacing
 * @param {String} [name] - name of the service
 */
function replaceInFileAsync(src, oldContent, newContent, dest, name) {

  return (cb) => {
    replaceInFile(src, oldContent, newContent, dest, cb);
  };
}


const replacer = {
  replaceInFile,
  replaceInFileAsync
};

module.exports = replacer;
