'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  misc = require('../helpers/misc'),
  creator = require('../helpers/creator'),
  async = require('async'),
  fs = require('fs'),
  git = require('gulp-git'),
  log = require('../helpers/logger');


/**
 * This function clones all provided sources or only specified topics
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */
const cloneDocuSources = (registry, config, next) => {
  let topicDetails;

  iterateRegClone(registry, config, next);
};

//simple abstraction, helper to use in callback
function iterateRegClone(registry, config, next) {

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {

    //clone repo to a given location basing on data provided in the registry
    cloneDocuRepo(topicDetails, cb);
  });
}

/**
 * This function clones a given topic's repository to a given location and logouts proper custom info
 * @param {Object} [topicDetails] - holds details of the repo that needs to be cloned.
 * @param {Function} [cb] - callback for asynchronous operation
 */
function cloneDocuRepo(topicDetails, cb) {

  const version = topicDetails.version || '';

  git.clone(topicDetails.location, {args: `${topicDetails.sourcesCloneLoc} -b ${topicDetails.branchTag}`}, (err) => {

    if (err) {
      if(err.code === 128) {
        log.warning(`${topicDetails.type} - ${topicDetails.name} ${version} is already cloned, use --force to download repository again`);
      }
      else {
        log.error(`${topicDetails.type} - ${topicDetails.name} ${version} wasn't successfully cloned because of: ${err}`);
      }
    }
    else {
      log.info(`${topicDetails.type} - ${topicDetails.name} ${version} successfully cloned into ${topicDetails.sourcesCloneLoc} using ${topicDetails.branchTag} branch or tag`);
    }
    cb();
  });
}


module.exports = cloneDocuSources;