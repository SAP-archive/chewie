'use strict';
const gulp = require('gulp'),
  log = require('./logger'),
  zip = require('gulp-zip'),
  validator = require('../helpers/validator');

 /**
  * This function makes an archive (*.zip)
  * @param {Array} [src] - array of source locations
  * @param {Array} [dest] - array of destination locations
  * @param {String} [zipName] - name of the zip archive
  * @param {String} [name] - name of the service
  * @param {Function} [next] - callback for asynch operations
  */
function zipFolder(src, dest, zipName, name, next) {
  gulp.src(`${src}/*`)
    .pipe(zip(`${zipName}.zip`))
    .pipe(gulp.dest(dest))
    .on('end', next);
}

/**
 * This function makes an archive (*.zip)
 * @param {Array} [src] - array of source locations
 * @param {Array} [dest] - array of destination locations
 * @param {String} [zipName] - name of the zip archive
 * @param {String} [serviceName] - name of the service
 */
function zipFolderAsync(src, dest, zipName, serviceName) {

  return (cb) => {
    validator.dirCheck(src, (err) => {

      if (err) return cb(err, serviceName);

      zipFolder(src, dest, zipName, serviceName, (err) => {

        if (err) return cb(err, serviceName);

        cb(null, serviceName);
      });
    });
  };
}

const ziper = {
  zipFolder,
  zipFolderAsync
};

module.exports = ziper;
