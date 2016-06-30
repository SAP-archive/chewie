'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  misc = require('../helpers/misc'),
  creator = require('../helpers/creator'),
  validator = require('../helpers/validator'),
  async = require('async'),
  fs = require('fs'),
  git = require('gulp-git'),
  log = require('../helpers/logger'),
  copier = require('../helpers/copier'),
  path = require('path');


/**
 * This function clones all provided sources or only specified topics
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */
function cloneDocuSources(registry, config, next) {

  iterateRegClone(registry, config, next);
}

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

  const origPath = path.resolve(process.cwd(), topicDetails.location);
  const destPath = path.resolve(process.cwd(), topicDetails.sourcesCloneLoc);

  if(topicDetails.local){

    return validator.dirCheck(topicDetails.location, (err) => {

      if(err) {
        log.error(`${topicDetails.type} - ${topicDetails.name} ${version} wasn't successfully cloned because there is no documentation in path: ${path.resolve(process.cwd(), topicDetails.location)}`);
        return cb(err);
      }

      copier.copyFiles(`${origPath}/**`, destPath, (err, data) => {
        if (err) {
          log.error(`${topicDetails.type} - ${topicDetails.name} ${version}  wasn't successfully cloned from local directory`);
        }
        else {
          log.info(`${topicDetails.type} - ${topicDetails.name} ${version} successfully cloned into ${destPath} using local directory`);
        }
        cb();
      });

    });

  }

  git.clone(topicDetails.location, {args: `${topicDetails.sourcesCloneLoc} -b ${topicDetails.branchTag}`}, (err) => {

    if (err) {
      if(err.message && err.message.indexOf('already exists and is not an empty directory')) {
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
