'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  replacer = require('../helpers/replacer'),
  copier = require('../helpers/copier'),
  misc = require('../helpers/misc'),
  pathCreator = require('../helpers/pathCreator'),
  async = require('async'),
  log = require('../helpers/logger');


/**
 * Function copies generated entries to proper locations
 * @param {Array} [registry] - array of full registry
 * @param {Object} [config] - basic integration configuration
 * @param {Function} [mapMarketsToRegions] - function accepts array of string with markets,
 *                                           should return array with region object {
 *                                                                                    code: location dir name,
 *                                                                                    domain: string to replace with defaultBaseURI from config
 *                                                                                   }
 * @param {Function} [next] - callback for asynch operations
 */
function globalization(registry, config, mapMarketsToRegions, next) {
  eachRegTopic.sync(registry, config, next, (topicDetails, cb) => {
    const regions = mapMarketsToRegions(topicDetails.markets, topicDetails.name);

    _globalizeTopic(topicDetails, regions, config, cb);
  });
}

function _globalizeTopic(topic, regions, config, cb){
  const sourcePathPattern = `${topic.genDocuLocation}/**/*`;
  const sourcePathInternalPattern = topic.genDocuLocationInternal ? `${topic.genDocuLocationInternal}/**/*` : null;

  if(!Array.isArray(regions)) return cb();

  const copiers = [];
  regions.forEach((region) => {
    const createDestinationPath = pathCreator.globalizationDestination(config.skeletonOutDestination, topic, region.code);

    const defaultDomain = config.defaultBaseUriDomain.replace(/^https?:\/\//, '');
    const copyRegion = _regionCopier(defaultDomain, region, config, topic.type);

    const destinationPath = createDestinationPath(topic.version, false);
    copiers.push(misc.asyncTaskCreator(copyRegion, [sourcePathPattern, destinationPath]));

    if(topic.latest){
      const destinationPathLatest = createDestinationPath('latest', false);
      copiers.push(misc.asyncTaskCreator(copyRegion, [sourcePathPattern, destinationPathLatest]));
    }
    if(sourcePathInternalPattern){
      const destinationPathInternal = createDestinationPath(topic.version, true);
      copiers.push(misc.asyncTaskCreator(copyRegion, [sourcePathInternalPattern, destinationPathInternal]));
    }
    if(topic.latest && sourcePathInternalPattern){
      const destinationPathInternalLatest = createDestinationPath('latest', true);
      copiers.push(misc.asyncTaskCreator(copyRegion, [sourcePathInternalPattern, destinationPathInternalLatest]));
    }
  });

  async.series(copiers, cb);
}

function _regionCopier(srcDomain, region, config, topicType){

  return function(sourcePathPattern, destinationPath, cb){

    const regExp = Array.isArray(config.topicsWithoutGlobalization) ? _generateRegExp(config.topicsWithoutGlobalization, srcDomain) : srcDomain;

    const afterCopyFiles = region.code ? _replaceUrl(destinationPath, region.code, topicType, cb) : cb;

    if(!region.domain){
      log.info(`Copy '${sourcePathPattern}' to '${destinationPath}'.`);
      return  copier.copyFiles(sourcePathPattern, destinationPath, afterCopyFiles);
    }

    log.info(`Copy '${sourcePathPattern}' to '${destinationPath}' and replace '${srcDomain}' to '${region.domain}'.`);
    return replacer.replaceInFile(sourcePathPattern, regExp, region.domain, destinationPath, afterCopyFiles);
  };
}

function _replaceUrl(destinationPath, regionCode, topicType, cb){
  return function(){
    const destinationPathPattern = `${destinationPath}/**/*`;
    const regExp = new RegExp(`\/${topicType}\/(?!(.*\/release_notes.html))`, 'g');

    replacer.replaceInFile(destinationPathPattern, regExp, `/${topicType}/${regionCode}/`, destinationPath, cb);
  };
}

function _generateRegExp(topicsWithoutGlobalization, srcDomain) {
  const skipProxyNames = topicsWithoutGlobalization;
  const proxyRegExp = skipProxyNames.map((name) => `\\w*\\/${name}`).join('|');
  return new RegExp(`(${srcDomain})(?!(${proxyRegExp}))`, 'g');
}

module.exports = globalization;
