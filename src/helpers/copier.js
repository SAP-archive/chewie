'use strict';

const gulp = require('gulp'),
  tap = require('gulp-tap'),
  path = require('path'),
  log = require('./logger.js'),
  validator = require('./validator.js');

/**
 * This function copies files from provided source to provided destiny
 * @param {Array} [src] - array of source locations
 * @param {String} [dest] - desting directory
 * @param {Function} [next] - callback for asynch operations
 */
function copyFiles(src, dest, next) {

  if(!src || !dest) return next(`Unable to perform copy operation because of wrong src: ${src} or dest: ${dest} value`);

  gulp.src(src)
    .pipe(gulp.dest(dest))
    .on('error', (err) => {
      log.error(`Informations about failure: \nsrc: ${src} \ndest: ${dest} \nerror: ${err}`);
      next(err);
    })
    .on('end', next);
}

/**
 * This function is a helper for parallel operations. Reuses copyFiles function
 * @param {String} [src] - source locations
 * @param {String} [dest] - desting directory
 * @param {String} [name] - name of the operation
 * @return {Function} anonymous function that triggers copy and accepts a callback
 */
function copyFilesAsync(src, dest, name) {

  return (cb) => {

    copyFiles(src, dest, (err) => {
      return cb(err, name);
    });
  };
}

/**
 * This function copies files from provided source to provided destiny with additional stream modifications
 * @param {Array} [src] - array of source locations
 * @param {String} [dest] - desting directory
 * @param {Function} [tapFunction] - custom stream content modification. It must be a function that returns an anonymous function and passes file variable into it
 * @param {Function} [next] - callback for asynch operations
 */
function copyFilesTap(src, dest, tapFunction, next) {

  if(!src || !dest) return next(`Unable to perform copy operation because of wrong src: ${src} or dest: ${dest} value`);

  gulp.src(src)
    .pipe(tap(tapFunction()))
    .pipe(gulp.dest(dest))
    .on('error', (err) => {
      log.error(`Informations about failure: \nsrc: ${src} \ndest: ${dest} \nfunction name: ${tapFunction.name} \nerror: ${err}`);
      next(err);
    })
    .on('end', next);
}


/**
 * This function is a helper for parallel operations. Reuses copyFilesTap function
 * @param {String} [src] - source locations
 * @param {String} [dest] - desting directory
 * @param {Function} [tapFunction] - custom stream content modification. It must be a function that returns an anonymous function and passes file variable into it
 * @param {String} [name] - name of the operation
 * @return {Function} anonymous function that triggers copy and accepts a callback
 */
function copyFilesTapAsync(src, dest, tapFunction, name) {

  return (cb) => {

    copyFilesTap(src, dest, tapFunction, (err) => {
      cb(err, name);
    });
  };
}

function copyDocuRepo(topicDetails, cb) {

  const version = topicDetails.version || '';

  const origPath = path.resolve(process.cwd(), topicDetails.location);
  const destPath = path.resolve(process.cwd(), topicDetails.sourcesCloneLoc);

  return validator.dirCheck(origPath, (err) => {

    if(err) {
      log.error(`${topicDetails.type} - ${topicDetails.name} ${version} wasn't successfully copied because there is no documentation in path: ${origPath}`);
      return cb(err);
    }

    copyFiles(`${origPath}/**`, destPath, (err, data) => {
      if (err) {
        log.error(`${topicDetails.type} - ${topicDetails.name} ${version}  wasn't successfully copied from local directory`);
      }
      else {
        log.info(`${topicDetails.type} - ${topicDetails.name} ${version} successfully copied into ${destPath} using local directory`);
      }
      cb();
    });
  });
}

const copiers = {
  copyFiles,
  copyFilesTap,
  copyFilesTapAsync,
  copyFilesAsync,
  copyDocuRepo
};


module.exports = copiers;
