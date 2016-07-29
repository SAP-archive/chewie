'use strict';

const eachRegTopic = require('../helpers/registryIterator'),
  copier = require('../helpers/copier'),
  async = require('async'),
  tutorialHelper = require('../helpers/tutorialHelper');

/**
 * Function versions and copy interactive tutorials.
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for async operations
 */
function copyTutorials(registry, config, next) {

  let isGs, shortName, shortNameInternal, version, src, srcInt, tutorialsDest, matrixFileLocation;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {

    shortName = topicDetails.shortName;
    shortNameInternal = topicDetails.shortNameInternal;
    version = topicDetails.version;

    src = topicDetails.srcLocationFiles;
    srcInt = topicDetails.srcLocationFilesInternal;

    tutorialsDest = topicDetails.tutorialsDest;
    matrixFileLocation = topicDetails.matrixFileLocation;

    async.parallel([
      tutorialHelper.copyAndRenameInteractiveTutorials(src, tutorialsDest, shortName, version, matrixFileLocation),
      tutorialHelper.copyAndRenameInteractiveTutorials(srcInt, tutorialsDest, shortNameInternal, version, matrixFileLocation)
    ], cb);
  });
}

module.exports = copyTutorials;
