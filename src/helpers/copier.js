'use strict';

const gulp = require('gulp'),
  tap = require('gulp-tap');

/**
 * This function copies files from provided source to provided destiny
 * @param {Array} [src] - array of source locations
 * @param {String} [dest] - desting directory
 * @param {Function} [next] - callback for asynch operations
 */
const copyFiles = (src, dest, next) => {

  if(!src || !dest) return next(`Unable to perform copy operation because of wrong src: ${src} or dest: ${dest} value`);

  gulp.src(src)
    .pipe(gulp.dest(dest))
    .on('end', next);
};

/**
 * This function is a helper for parallel operations. Reuses copyFiles function
 * @param {String} [src] - source locations
 * @param {String} [dest] - desting directory
 * @param {String} [name] - name of the operation
 * @return {Function} anonymous function that triggers copy and accepts a callback
 */
const copyFilesAsync = (src, dest, name) => {

  return (cb) => {

    copyFiles(src, dest, (err) => {

      if (err) return cb(err, name);

      cb(null, name);
    });
  };
};

/**
 * This function copies files from provided source to provided destiny with additional stream modifications
 * @param {Array} [src] - array of source locations
 * @param {String} [dest] - desting directory
 * @param {Function} [tapFunction] - custom stream content modification. It must be a function that returns an anonymous function and passes file variable into it
 * @param {Function} [next] - callback for asynch operations
 */
const copyFilesTap = (src, dest, tapFunction, next) => {

  if(!src || !dest) return next(`Unable to perform copy operation because of wrong src: ${src} or dest: ${dest} value`);

  gulp.src(src)
    .pipe(tap(tapFunction()))
    .pipe(gulp.dest(dest))
    .on('end', next);
};


/**
 * This function is a helper for parallel operations. Reuses copyFilesTap function
 * @param {String} [src] - source locations
 * @param {String} [dest] - desting directory
 * @param {Function} [tapFunction] - custom stream content modification. It must be a function that returns an anonymous function and passes file variable into it
 * @param {String} [name] - name of the operation
 * @return {Function} anonymous function that triggers copy and accepts a callback
 */
const copyFilesTapAsync = (src, dest, tapFunction, name) => {

  return (cb) => {

    copyFilesTap(src, dest, tapFunction, (err) => {

      if (err) return cb(err, name);

      cb(null, name);
    });
  };
};

const copiers = {
  copyFiles,
  copyFilesTap,
  copyFilesTapAsync,
  copyFilesAsync
};


module.exports = copiers;