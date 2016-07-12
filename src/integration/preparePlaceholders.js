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
      moveContentAsyncDir(docuSrcLocation, placeholderLocation, topicDetails, 'external docu'),
      moveContentAsyncFile(apiConsoleLocation, `${apiConsoleLocation}/api.raml`, placeholderAPIConsoleLocation, topicDetails, 'external apiconsole'),

      moveContentAsyncDir(docuSrcLocationInternal, placeholderLocation, topicDetails, 'internal docu'),
      moveContentAsyncFile(apiConsoleLocationInternal, `${apiConsoleLocationInternal}/api.raml`, placeholderAPIConsoleLocation, topicDetails, 'internal apiconsole'),

      moveContentAsyncDir(rnSrcLocation, placeholderRNLocation, topicDetails, 'external release notes'),
      moveContentAsyncDir(rnSrcLocationInternal, placeholderRNLocation, topicDetails, 'internal release notes')
    ], cb);

  });
}

//helper to run in async paralell for both internal and external content
function moveContentAsyncDir(docuLocation, phLocation, topicDetails, name) {

  return (cb) => {

    validator.dirCheck(docuLocation, (err) => {

      if (err) return cb(err, name);

      replaceAndMove(phLocation, docuLocation, topicDetails, (err) => {

        cb(err, name);
      });
    });
  };
}

//helper to run in async paralell for both internal and external content
function moveContentAsyncFile(docuLocation, fileLocation, phLocation, topicDetails, name) {

  return (cb) => {

    validator.fileCheck(fileLocation, (err) => {

      if (err) return cb(err, name);

      replaceAndMove(phLocation, docuLocation, topicDetails, (err) => {

        cb(err, name);
      });
    });
  };
}

//replace during move of placeholders
function replaceAndMove(src, dest, topic, next) {

  if(!src || !dest) return next(`Unable to perform operation on topic ${topic.name} because of wrong src: ${src} or dest: ${dest} value`);

  const internal = (dest.indexOf('internal') !== -1),
    collectionName = internal ? topic.collectionNameInternal : topic.collectionName,
    releaseNotesPH = internal ? 'internalReleaseNotes' : 'releaseNotes',
    collectionRN = internal ? 'internalPosts' : 'posts',
    releaseNotesLayoutPH = internal ? 'internal_release_notes' : 'release_notes',
    name = topic.name,
    shortName = topic.shortName,
    version = topic.version,
    isLatest = topic.latestVersion ? 'latest' : topic.version,
    baseUri = topic.baseUri,
    isInternalUrlOtherPH = internal ? 'internal/' : '',
    isInternalUrlPH = internal ? '/internal' : '',
    isInternalPH = internal ? 'Internal' : '',
    collectionAPIConsoles = internal ? 'internalApiConsoles' : 'apiconsoles',
    lengthPH = internal ? '4' : '3',
    internalPH = internal ? 'internal_' : '';

  gulp.src(src)
    .pipe(replace('collectionNamePH', collectionName))
    .pipe(replace('releaseNotesPH', releaseNotesPH))
    .pipe(replace('collectionRN', collectionRN))
    .pipe(replace('releaseNotesLayoutPH', releaseNotesLayoutPH))
    .pipe(replace('serviceNamePH', name))
    .pipe(replace('serviceShortNamePH', shortName))
    .pipe(replace('serviceVersionRAML', version))
    .pipe(replace('serviceVersionPH', isLatest))
    .pipe(replace('serviceUri', baseUri))
    .pipe(replace('isInternalUrlOtherPH', isInternalUrlOtherPH))
    .pipe(replace('isInternalUrlPH', isInternalUrlPH))
    .pipe(replace('isInternalPH', isInternalPH))
    .pipe(replace('collectionAPIConsolesPH', collectionAPIConsoles))
    .pipe(replace('lengthPH', lengthPH))
    .pipe(replace('internalPH', internalPH))
    .pipe(gulp.dest(dest))
    .on('end', next);

}

module.exports = preparePlaceholders;
