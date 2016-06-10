
'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  async = require('async'),
  cloner = require('../helpers/cloner'),
  metaBuild = require('../helpers/metaBuild'),
  creator = require('../helpers/creator'),
  testHelper = require('../../test/helpers/testHelper'),
  fs = require('fs'),
  logger = require('./../helpers/logger'),
  log = require('../helpers/logger');

/**
 * This function generates meta-info files for all the topics locations provided in the registry and release notes basing on the latest repo results or on the current directory structure.
 * @param {Array} [registry] - array of full registry
 * @param {Array} [topics] - array of chosen topics from the registry. Pass 'null' if you want to generate for all topics in the registry.
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */

function createMetaInfo(registry, topics, config, next) {
  async.series([
    latestRepoCloner(config),
    metaInfoCreator(registry, topics, config)
  ], next);
}


/**
 * This function clones latest repository when needed.
 * @param {Object} [config] - basic integration configuration
 */
function latestRepoCloner(config) {
  return (cb) => {

    if(process.env.REGISTRY_LOCATION === 'local') return cb();

    //clone the latest generated docu portal
    const latestDocu = config.generationResult.srcLocation;
    const branch = config.generationResult.branch;
    const expectedCloneLocation = config.generationResult.clonedResultFolderPath;

    logger.info(`Cloning ${config.generationResult.latestResultRepo} repository from ${config.generationResult.srcLocation}...`);
    cloner.cloneRepo(latestDocu, branch, expectedCloneLocation, (err) => {
      if (err) logger.error(err);

      return cb();
    });

  };
}

/**
 * This function generates meta-info files.
 * @param {Array} [registry] - array of full registry
 * @param {Array} [topics] - array of chosen topics from the registry. Pass 'null' if you want to generate for all topics in the registry.
 * @param {Object} [config] - basic integration configuration
 */
function metaInfoCreator (registry, topics, config) {

  return (cb) => {

    let clonedGenDestLocation, clonedGenDestLocationInternal, metaDest, metaDestInternal, metaFileName,
      metaDestFullPath, metaDestFullPathInternal, metaContent, isMetaNeeded, isMetaInternalNeeded,
      clonedGenRNDestLocationLatest, clonedGenRNDestLocationInternalLatest, metaDestRN, metaDestRNInternal, metaDestRNFullPath,
      metaDestRNFullPathInternal, isMetaRNNeeded, isMetaRNInternalNeeded;

    //once the latest gen docu portal is cloned, we generate meta-inf file for each topic that is present there
    eachRegTopic.async(registry, config, cb, (topicDetails, done) => {

      metaFileName = config.docu.metaFileName;
      metaContent = metaBuild.build(topicDetails);

      //DOCUMENTATION
      clonedGenDestLocation = topicDetails.clonedGenDestLocation;
      clonedGenDestLocationInternal = topicDetails.clonedGenDestLocationInternal;
      metaDest = topicDetails.topicSrcLocation;
      metaDestInternal = topicDetails.topicSrcLocationInternal;
      metaDestFullPath = `${metaDest}/${metaFileName}`;
      metaDestFullPathInternal = `${metaDestInternal}/${metaFileName}`;
      isMetaNeeded = shouldHaveMetaFile(topicDetails, topics, clonedGenDestLocation, metaDest);
      isMetaInternalNeeded = shouldHaveMetaFile(topicDetails, topics, clonedGenDestLocationInternal, metaDestInternal);

      //RELEASE NOTES
      clonedGenRNDestLocationLatest = topicDetails.clonedGenRNDestLocationLatest;
      clonedGenRNDestLocationInternalLatest = topicDetails.clonedGenRNDestLocationInternalLatest;
      metaDestRN = topicDetails.rnBaseLocation;
      metaDestRNInternal = topicDetails.rnBaseLocationInternal;
      metaDestRNFullPath = `${metaDestRN}/${metaFileName}`;
      metaDestRNFullPathInternal = `${metaDestRNInternal}/${metaFileName}`;
      isMetaRNNeeded = metaDestRN && shouldHaveMetaFile(topicDetails, topics, clonedGenRNDestLocationLatest, metaDestRN);
      isMetaRNInternalNeeded = metaDestRNInternal && shouldHaveMetaFile(topicDetails, topics, clonedGenRNDestLocationInternalLatest, metaDestRNInternal);

      async.parallel([
        metaCreator(isMetaNeeded, metaDestFullPath, metaContent, 'external docu'),
        metaCreator(isMetaInternalNeeded, metaDestFullPathInternal, metaContent, 'internal docu'),
        metaCreator(isMetaRNNeeded, metaDestRNFullPath, metaContent, 'external release notes'),
        metaCreator(isMetaRNInternalNeeded, metaDestRNFullPathInternal, metaContent, 'internal release notes')
      ], done);
    });
  };
}

//helper to run in async paralell for both internal and external content
function metaCreator(isMetaNeeded, metaDest, metaContent, name) {
  return (cb) => {
    if (isMetaNeeded) {
      creator.createFile(metaDest, metaContent, () => {
        cb(null, name);
      });
    }
    else {
      cb(null, name);
    }
  };
}

// Determines if topic should have meta file
// These are either files present in last portal version or the ones specified in the topics list
function shouldHaveMetaFile(topicDetails, topics, dir, metaDest){

  let shouldHaveMetaFile = false;

  //if there is a specific list of topics specified,
  //then we should generate meta inf for them by default and not only if they were build previously.
  //Because there might be a topic build for the first time.
  //We do it only if docu files are present


  if ((!topics && testHelper.dirCheckSync(metaDest)) || (topics && testHelper.dirCheckSync(metaDest))) return shouldHaveMetaFile = true;

  if (topics && (topics.indexOf(topicDetails.name) !== -1) && testHelper.dirCheckSync(metaDest)){
    shouldHaveMetaFile = true;
  }
  else {
    shouldHaveMetaFile = testHelper.dirCheckSync(dir);

    //if topic is not in topic list but present in previous out, we need to create a dir where meta inf can be created
    if (shouldHaveMetaFile)
      creator.createDir(metaDest);
  }

  return shouldHaveMetaFile;

}

module.exports = createMetaInfo;
