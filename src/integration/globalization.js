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
  regions.forEach((region) => {
    const destinationPath = `${config.skeletonOutDestination}/${topic.type}/${region.code}/${topic.shortName}/${topic.version}`;
    _copyRegion(sourcePathPattern, destinationPath, config.defaultBaseUriDomain, region, topic.type);
    if(topic.latest){
      const destinationPathLatest = `${config.skeletonOutDestination}/${topic.type}/${region.code}/${topic.shortName}/latest`;
      _copyRegion(sourcePathPattern, destinationPathLatest, config.defaultBaseUriDomain, region, topic.type);
    }
    if(sourcePathInternalPattern){
      const destinationPathInternal = `${config.skeletonOutDestination}/internal/${topic.type}/${region.code}/${topic.shortName}/${topic.version}`;
      _copyRegion(sourcePathInternalPattern, destinationPathInternal, config.defaultBaseUriDomain, region, topic.type);
      if(topic.latest){
        const destinationPathInternalLatest = `${config.skeletonOutDestination}/internal/${topic.type}/${region.code}/${topic.shortName}/latest`;
        _copyRegion(sourcePathInternalPattern, destinationPathInternalLatest, config.defaultBaseUriDomain, region, topic.type);
      }
    }
  });
}

function _copyRegion(sourcePathPattern, destinationPath, baseUriDomain, region, type){
  replacer.replaceInFile(sourcePathPattern, baseUriDomain, region.domain, destinationPath, _replaceUrl(destinationPath, region.code, type));
}

function _replaceUrl(destinationPath, regionCode, topicType){
  return () => {
    const destinationPathPattern = `${destinationPath}/**/*`;
    replacer.replaceInFile(destinationPathPattern, `/${topicType}/`, `/${topicType}/${regionCode}/`, destinationPath, () => {});
  };
}

module.exports = globalization;
