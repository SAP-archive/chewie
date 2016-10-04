'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  async = require('async'),
  gulp = require('gulp'),
  validator = require('../helpers/validator'),
  fs = require('fs'),
  log = require('../helpers/logger'),
  replace = require('gulp-replace');

/**
 * This function copies proper placeholders to proper topic locaiton, and performs injection of a number of variables
 * @param {Array} [registry] - array of full registry
 * @param {Function} [next] - callback for asynch operations
 */
function preparePlaceholders(registry, config, next) {

  let placeholderLocation, docuSrcLocation, docuSrcLocationInternal,
    placeholderRNLocation, rnSrcLocation, rnSrcLocationInternal, placeholderAPIConsoleLocation, apiConsoleLocation, apiConsoleLocationInternal;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {

    //DOCUMENTATION
    placeholderLocation = topicDetails.placeholderLocation;
    docuSrcLocation = topicDetails.topicSrcLocation;
    docuSrcLocationInternal = topicDetails.topicSrcLocationInternal;

    //RELEASE NOTES
    placeholderRNLocation = topicDetails.placeholderRNLocation;
    rnSrcLocation = topicDetails.rnBaseLocation;
    rnSrcLocationInternal = topicDetails.rnBaseLocationInternal;

    //API CONSOLES
    placeholderAPIConsoleLocation = topicDetails.placeholderAPIConsoleLocation;
    apiConsoleLocation = (topicDetails.isService) ? topicDetails.topicSrcLocation : false;
    apiConsoleLocationInternal = (topicDetails.isService) ? topicDetails.topicSrcLocationInternal : false;

    async.parallel([
      moveContentAsyncDir(docuSrcLocation, placeholderLocation, 'external docu'),
      moveContentAsyncFile(apiConsoleLocation, `${apiConsoleLocation}/api.raml`, placeholderAPIConsoleLocation, 'external apiconsole'),

      moveContentAsyncDir(docuSrcLocationInternal, placeholderLocation, 'internal docu'),
      moveContentAsyncFile(apiConsoleLocationInternal, `${apiConsoleLocationInternal}/api.raml`, placeholderAPIConsoleLocation, 'internal apiconsole'),

      moveContentAsyncDir(rnSrcLocation, placeholderRNLocation, 'external release notes'),
      moveContentAsyncDir(rnSrcLocationInternal, placeholderRNLocation, 'internal release notes')
    ], cb);

  });
}

//helper to run in async paralell for both internal and external content
function moveContentAsyncDir(docuLocation, phLocation, name) {

  return (cb) => {

    validator.dirCheck(docuLocation, (err) => {

      if (err) return cb(err, name);

      replaceAndMove(phLocation, docuLocation, (err) => {

        cb(err, name);
      });
    });
  };
}

//helper to run in async paralell for both internal and external content
function moveContentAsyncFile(docuLocation, fileLocation, phLocation, name) {

  return (cb) => {

    validator.fileCheck(fileLocation, (err) => {

      if (err) return cb(err, name);

      replaceAndMove(phLocation, docuLocation, (err) => {

        cb(err, name);
      });
    });
  };
}

//replace during move of placeholders
function replaceAndMove(src, dest, next) {

  if(!src || !dest) return next(`Unable to perform operation on topic ${topic.name} because of wrong src: ${src} or dest: ${dest} value`);

  gulp.src(src)
    .pipe(gulp.dest(dest))
    .on('end', next);

}

module.exports = preparePlaceholders;
