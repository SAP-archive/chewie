'use strict';
const gulp = require('gulp'),
  concatUtil = require('gulp-concat-util'),
  log = require('./logger');


/**
 * This function concats all json files into one array in one file, named as provided in gulpConfig under 'registry.fileName attribute'.
 * @param {string} [registryLocation] - this is the location of the registry json files that need to be combined in one.
 * @param {object} [config] - the configuration that you need to pass to the function.
 * @param {function} [next] - callback for asynch operations
 */
const concatRegistry = (registryLocation, config, next) => {

  log.info('Registry concatenation!');

  gulp.src(`${registryLocation}/*.json`)
      .pipe(concatUtil(config.registry.registryPath, {sep:','}))
      .pipe(concatUtil.header('['))
      .pipe(concatUtil.footer(']'))
      .pipe(gulp.dest('./'))
      .on('end', () => {
        log.info('Registry concatenation successfully completed');
        next();
      });
};

const concaters = {
  concatRegistry
};

module.exports = concaters;
