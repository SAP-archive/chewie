'use strict';
const cloner = require('../helpers/cloner'),
  git = require('gulp-git'),
  log = require('../helpers/logger'),
  concater = require('../helpers/concater'),
  creator = require('../helpers/creator'),
  misc = require('../helpers/misc'),
  path = require('path');

/**
 * This function gets the registry from a given location and combines into one json file.
 * You need to make sure to have a proper configuration settings in chewieConfig().js ('registry' attribute).
 * There are 2 different cases allowed, 'local' and 'remote'.
 * For 'remote' case, you need to pass a branch or tag name for the remote repository.
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [next] - callback for asynch operations
 */
const prepareRegistry = (topics, config, next) => {

  const registrySource = config.registry.path;
  const registryOrigin = config.registry.location;
  const branchTag = config.registry.branch;

  switch(registryOrigin){

  case 'local':

    prepareRegistryForLocal(registrySource, config, () => {
      topics ? shrinkedRegistry(topics, config, next) : next();
    });

    break;

  case 'remote':

    prepareRegistryForExternal(registrySource, branchTag, config, () => {
      topics ? shrinkedRegistry(topics, config, next) : next();
    });

    break;

  default:

    throw new Error(`You need to specify a proper location of your registry.
           It should be local or remote and not something that you have currently: ${config.registry.location}`);
  }
};

function prepareRegistryForLocal(registrySource, config, next) {

  //calling concat function to prepare a final registry file
  concater.concatRegistry(registrySource, config, next);
}

function prepareRegistryForExternal(registrySource, branchTag, config, next) {
  const clonePath = config.registry.clonedRegistryFolderPath;
  const registryCloneLocation = config.registry.pathFolderWithClonedRegistry;

  //clone repo and then create the registry
  cloner.cloneRepo(registrySource, branchTag, clonePath, () => {

    //calling concat function to prepare a final registry file
    concater.concatRegistry(registryCloneLocation, config, next);
  });
}

function shrinkedRegistry(topics, config, next) {
  let registry = require(path.resolve(process.cwd(), `${config.tempLocation}/${config.registry.fileName}`));
  registry = misc.registryShrink(registry, topics);
  creator.createFile(config.registry.shortRegistryPath, JSON.stringify(registry), next);
}

module.exports = prepareRegistry;
