'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  creator = require('../helpers/creator'),
  replacer = require('../helpers/replacer'),
  async = require('async'),
  nameCreator= require('../helpers/nameCreator');


  /**
   * Function generates partials with service urls.
   * @param {Array} [registry] - array of full registry
   * @param {Object} [config] - basic integration configuration
   * @param {Function} [next] - callback for asynch operations
   */

function createUrlPartials(registry, config, next) {

  let baseUri, internalBaseUri, isInternalNameAvailable, latest, topicSrcLocation, topicSrcLocationInternal, externalFileName, internalFileName, externalFilePath, internalFilePath, externalFileNameForLatest, internalFileNameForLatest, externalPath, internalPath, isInternalNameExists;

  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {

    if(!topicDetails.isService)
      return cb();


    baseUri = topicDetails.baseUri;
    internalBaseUri = topicDetails.baseUriInternal;

    isInternalNameExists = topicDetails.isInternalNameExists;

    latest = topicDetails.latest;

    topicSrcLocation = topicDetails.topicSrcLocation;
    topicSrcLocationInternal = topicDetails.topicSrcLocationInternal;

    externalFilePath = nameCreator.createPartialName(topicDetails.shortName, 'url', topicDetails.version, latest, 'html');
    internalFilePath = nameCreator.createPartialName(topicDetails.shortNameInternal, 'url', topicDetails.version, latest, 'html');

    externalFileNameForLatest = nameCreator.createPartialName(topicDetails.shortName, 'url', topicDetails.version, true);
    internalFileNameForLatest = nameCreator.createPartialName(topicDetails.shortNameInternal, 'url', topicDetails.version, true);

    externalPath = `${topicDetails.partialsMainLocation}/${externalFilePath}`;
    internalPath = `${topicDetails.partialsMainLocationInternal}/${internalFilePath}`;

    async.parallel([
      _createAndRenamePartialsIfNeeded(externalPath, baseUri, externalFileNameForLatest, externalFilePath, topicSrcLocation, latest, true),
      _createAndRenamePartialsIfNeeded(internalPath, internalBaseUri, internalFileNameForLatest, internalPath, topicSrcLocationInternal, latest, isInternalNameExists)
    ], cb);

  });
}

function _createAndRenamePartialsIfNeeded(path, baseUri, nameForLatest, fileName, topicSrcLocation, latest, isInternalNameExists) {

  return (cb) => {
    if(!isInternalNameExists) return cb();

    async.parallel([
      creator.createFilesAsync(path, baseUri),
      _replaceUrlPartialsIfNeeded(`${topicSrcLocation}/*.*`, nameForLatest, fileName, topicSrcLocation, latest)
    ], cb);
  };

}


function _replaceUrlPartialsIfNeeded(src, oldContent, newContent, dest, latest) {

  return (cb) => {
    if(latest) return cb();
    replacer.replaceInFile(src, oldContent, newContent, dest, cb);
  };
}


module.exports = createUrlPartials;
