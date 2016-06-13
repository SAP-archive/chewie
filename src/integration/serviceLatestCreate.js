'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  copier = require('../helpers/copier'),
  async = require('async');


/**
 * This function performs operation on already generated files, it just duplicates content and saves it under new location
 * Its main purpose is to have 2 links to the same content for the latest version of the service.
 * We need URL with 'latest' word and also with version number
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for async operations
 */
function serviceLatestCreate(registry, config, next) {

  let src, dest, srcInt, destInt, srcRN, destRN, srcIntRN, destIntRN;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {

    if (!topicDetails.latest) return cb();

    //DOCUMENTATION
    src = `${topicDetails.genDocuLocationLatest}/**`;
    dest = topicDetails.genDocuLocation;
    srcInt = `${topicDetails.genDocuLocationLatestInternal}/**`;
    destInt = topicDetails.genDocuLocationInternal;

    //RELEASE NOTES
    srcRN = `${topicDetails.genRNLocationLatest}/**`;
    destRN = topicDetails.genRNLocation;
    srcIntRN = `${topicDetails.genRNLocationLatestInternal}/**`;
    destIntRN = topicDetails.genRNLocationInternal;

    async.series([

      copier.copyFilesAsync(src, dest, 'external docu'),
      copier.copyFilesAsync(srcInt, destInt, 'internal docu'),
      copier.copyFilesAsync(srcRN, destRN, 'external rn'),
      copier.copyFilesAsync(srcIntRN, destIntRN, 'internal rn')

    ], cb);
  });
}

module.exports = serviceLatestCreate;
