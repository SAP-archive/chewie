'use strict';
const cloner = require('../helpers/cloner'),
  git = require('gulp-git'),
  log = require('../helpers/logger'),
  concater = require('../helpers/concater'),
  creator = require('../helpers/creator'),
  misc = require('../helpers/misc'),
  validator = require('../helpers/validator'),
  path = require('path');

/**
 * This function gets the registry from a given location and combines into one json file.
 * You need to make sure to have a proper configuration settings in chewieConfig().js ('registry' attribute).
 * There are 2 different cases allowed, 'local' and 'remote'.
 * For 'remote' case, you need to pass a branch or tag name for the remote repository.
 * @param {Object} [topics] - array with list of objects with topic name and type.
 * Used in case you do not want to prepare registry with all topics but only with specific ones
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */

function prepareRegistry(topics, config, next) {

  const registrySource = config.registry.path,
    registryOrigin = config.registry.location,
    registryPath = config.registry.registryPath,
    branchTag = config.registry.branch;

  //First step of preparing the registry is to actually check if it isn't already prepared
  //If registry exists, we pass to callback
  validator.fileCheck(registryPath, (err) => {

    if (!err) {

      return next();
    }
    switch(registryOrigin){

    case 'local':

      _prepareRegistryForLocal(registrySource, config, () => {
        let registry = misc.getRegistry(path.resolve(process.cwd(), `${config.tempLocation}/${config.registry.fileName}`));
        const wildcardedTopics = misc.getTopicsByWildcard(registry, topics);

        topics ? _shrinkedRegistry(wildcardedTopics, registry, config, next) : next();
      });

      break;

    case 'remote':

      _prepareRegistryForExternal(registrySource, branchTag, config, () => {
        let registry = misc.getRegistry(path.resolve(process.cwd(), `${config.tempLocation}/${config.registry.fileName}`));
        const wildcardedTopics = misc.getTopicsByWildcard(registry, topics)

        topics ? _shrinkedRegistry(wildcardedTopics, registry, config, next) : next();
      });

      break;

    default:

      throw new Error(`You need to specify a proper location of your registry.
             It should be local or remote and not something that you have currently: ${config.registry.location}`);
    }
  });
}

function _prepareRegistryForLocal(registrySource, config, next) {

  //calling concat function to prepare a final registry file
  concater.concatRegistry(registrySource, config, next);
}

function _prepareRegistryForExternal(registrySource, branchTag, config, next) {
  const clonePath = config.registry.clonedRegistryFolderPath;
  const registryCloneLocation = config.registry.pathFolderWithClonedRegistry;

  //clone repo and then create the registry
  cloner.cloneRepo(registrySource, branchTag, clonePath, (e) => {

    if(e) log.warning(e);

    //calling concat function to prepare a final registry file
    concater.concatRegistry(registryCloneLocation, config, next);
  });
}

function _shrinkedRegistry(topics, registry, config, next) {

  const shrinkedRegistry = misc.registryShrink(registry, topics);
  creator.createFile(config.registry.shortRegistryPath, JSON.stringify(shrinkedRegistry), next);
}

module.exports = prepareRegistry;
