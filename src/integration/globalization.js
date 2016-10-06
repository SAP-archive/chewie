'use strict';
const eachRegTopic = require('../helpers/registryIterator'),
  replacer = require('../helpers/replacer'),
  async = require('async');

function globalization(registry, config, mapMarketsToRegions, next) {
  eachRegTopic.async(registry, config, next, (topicDetails, cb) => {
    if(topicDetails.type !== 'services') return cb();
    const regions = mapMarketsToRegions(topicDetails.markets);
    _globalizeTopic(topicDetails, regions, config);
    cb();
  });
}

function _globalizeTopic(topic, regions, config){
  const sourcePathPattern = `${topic.genDocuLocation}/**/*`;
  const sourcePathInternalPattern = topic.genDocuLocationInternal ? `${topic.genDocuLocationInternal}/**/*` : null;
  
  if(!regions || !regions.length) 
    return;
    
  regions.forEach((region) => {
    
    const createDestinationPath = _destinationPathCreator(config.skeletonOutDestination, topic, region.code);
    const copyRegion = _regionCopier(config.defaultBaseUriDomain, region, topic.type);

    const destinationPath = createDestinationPath(topic.version, false);
    copyRegion(sourcePathPattern, destinationPath);
    if(topic.latest){
      const destinationPathLatest = createDestinationPath('latest', false);
      copyRegion(sourcePathPattern, destinationPathLatest);
    }
    if(sourcePathInternalPattern){
      const destinationPathInternal = createDestinationPath(topic.version, true);
      copyRegion(sourcePathInternalPattern, destinationPathInternal);
    }
    if(topic.latest && sourcePathInternalPattern){
      const destinationPathInternalLatest = createDestinationPath('latest', true);
      copyRegion(sourcePathInternalPattern, destinationPathInternalLatest);
    }
  });
}

function _destinationPathCreator(outDestination, topic, regionCode){
  return function(version, isInternal){
    const internalPath = isInternal ? '/internal' : '';
    return `${outDestination}${internalPath}/${topic.type}/${regionCode}/${topic.shortName}/${version}`;
  };
}

function _regionCopier(baseUriDomain, region, topicType){
  return function(sourcePathPattern, destinationPath){
    replacer.replaceInFile(sourcePathPattern, baseUriDomain, region.domain, destinationPath, _replaceUrl(destinationPath, region.code, topicType));
  };
}

function _replaceUrl(destinationPath, regionCode, topicType){
  return function(){
    const destinationPathPattern = `${destinationPath}/**/*`;
    replacer.replaceInFile(destinationPathPattern, `/${topicType}/`, `/${topicType}/${regionCode}/`, destinationPath, () => {});
  };
}

module.exports = globalization;
