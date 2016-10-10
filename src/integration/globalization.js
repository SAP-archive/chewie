'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  replacer = require('../helpers/replacer'),
  copier = require('../helpers/copier'),
  misc = require('../helpers/misc'),
  pathCreator = require('../helpers/pathCreator'),
  async = require('async'),
  log = require('../helpers/logger');
  

function globalization(registry, config, mapMarketsToRegions, next) {
  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {
    const regions = mapMarketsToRegions(topicDetails.markets);
    _globalizeTopic(topicDetails, regions, config, cb);
  });
}

function _globalizeTopic(topic, regions, config, cb){
  const sourcePathPattern = `${topic.genDocuLocation}/**/*`;
  const sourcePathInternalPattern = topic.genDocuLocationInternal ? `${topic.genDocuLocationInternal}/**/*` : null;
  
  if(!regions || !regions.length) 
    return cb();

  const copiers = [];
  regions.forEach((region) => {
    
    const createDestinationPath = pathCreator.globalizationDestination(config.skeletonOutDestination, topic, region.code);

    const defaultDomain = config.defaultBaseUriDomain.replace(/^https?:\/\//, '');
    const copyRegion = _regionCopier(defaultDomain, region, topic.type);

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

function _regionCopier(srcDomain, region, topicType){

  return function(sourcePathPattern, destinationPath, cb){

    const afterCopyFiles = region.code ? _replaceUrl(destinationPath, region.code, topicType, cb) : cb;
    
    if(!region.domain){
      log.info(`Copy '${sourcePathPattern}' to '${destinationPath}'.`);
      return  copier.copyFiles(sourcePathPattern, destinationPath, afterCopyFiles);
    }

    log.info(`Copy '${sourcePathPattern}' to '${destinationPath}' and replace '${srcDomain}' to '${region.domain}'.`);
    return replacer.replaceInFile(sourcePathPattern, srcDomain, region.domain, destinationPath, afterCopyFiles);
  };
}

function _replaceUrl(destinationPath, regionCode, topicType, cb){
  return function(){
    const destinationPathPattern = `${destinationPath}/**/*`;
    replacer.replaceInFile(destinationPathPattern, `/${topicType}/`, `/${topicType}/${regionCode}/`, destinationPath, cb);
  };
}

module.exports = globalization;
